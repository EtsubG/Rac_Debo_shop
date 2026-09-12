import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { env } from '../config/env.js';
import { UnauthorizedError, NotFoundError, ConflictError, BadRequestError } from '../utils/errors.js';
import type { AdminUser, JwtPayload } from '../types/index.js';

interface AdminRow {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'super' | 'admin';
  created_at: string;
}

export async function listAdmins(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, username, email, role, created_at')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    username: r.username,
    email: r.email,
    role: r.role,
    createdAt: r.created_at,
  }));
}

export async function login(username: string, password: string): Promise<{
  token: string;
  admin: AdminUser;
}> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .or(`username.eq.${username},email.eq.${username}`)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new UnauthorizedError('Invalid credentials');

  const admin = data as AdminRow;
  const ok = await bcrypt.compare(password, admin.password_hash);
  if (!ok) throw new UnauthorizedError('Invalid credentials');

  const payload: JwtPayload = { sub: admin.id, username: admin.username, role: admin.role };
  const token = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });

  return {
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      createdAt: admin.created_at,
    },
  };
}

export interface CreateAdminInput {
  username: string;
  email: string;
  password: string;
  role: 'super' | 'admin';
}

export async function createAdmin(input: CreateAdminInput): Promise<AdminUser> {
  if (input.password.length < 8) {
    throw new BadRequestError('Password must be at least 8 characters');
  }

  const { data: existing } = await supabase
    .from('admin_users')
    .select('id')
    .or(`username.eq.${input.username},email.eq.${input.email}`)
    .maybeSingle();

  if (existing) throw new ConflictError('Username or email already exists');

  const password_hash = await bcrypt.hash(input.password, 12);

  const { data, error } = await supabase
    .from('admin_users')
    .insert({
      username: input.username,
      email: input.email,
      password_hash,
      role: input.role,
    })
    .select('id, username, email, role, created_at')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    username: data.username,
    email: data.email,
    role: data.role,
    createdAt: data.created_at,
  };
}

export async function deleteAdmin(id: string, requesterId: string): Promise<void> {
  if (id === requesterId) throw new BadRequestError('You cannot delete your own account');

  const { data: target, error } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!target) throw new NotFoundError('Admin not found');
  if (target.role === 'super') throw new BadRequestError('Cannot delete a super admin');

  const { error: delErr } = await supabase.from('admin_users').delete().eq('id', id);
  if (delErr) throw delErr;
}

export async function changePassword(
  adminId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  if (newPassword.length < 8) {
    throw new BadRequestError('New password must be at least 8 characters');
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('password_hash')
    .eq('id', adminId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new NotFoundError('Admin not found');

  const ok = await bcrypt.compare(currentPassword, data.password_hash);
  if (!ok) throw new UnauthorizedError('Current password is incorrect');

  const password_hash = await bcrypt.hash(newPassword, 12);
  const { error: upErr } = await supabase
    .from('admin_users')
    .update({ password_hash })
    .eq('id', adminId);

  if (upErr) throw upErr;
}