import { useEffect, useState } from 'react';
import {
  Lock,
  UserPlus,
  Shield,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Trash2,
  RefreshCw,
} from 'lucide-react';

import type { AdminUser } from '@/types';

import { Badge, Button, Input } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

import {
  getCurrentAdmin,
  changeAdminPassword,
  getAdminUsers,
  createAdmin,
  deleteAdmin,
} from '@/api';

interface AdminSettingsProps {
  onLogout?: () => void;
}

export function AdminSettings({ onLogout }: AdminSettingsProps) {
  const toast = useToast();

  // Current admin
  const [currentAdmin, setCurrentAdmin] =
    useState<AdminUser | null>(null);

  // Existing admins
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  // Change password
  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  // Add admin
  const [newUsername, setNewUsername] =
    useState('');

  const [newEmail, setNewEmail] =
    useState('');

  const [newAdminPassword, setNewAdminPassword] =
    useState('');

  const [confirmAdminPassword, setConfirmAdminPassword] =
    useState('');

  const [showAdminPassword, setShowAdminPassword] =
    useState(false);

  const [showAdminConfirm, setShowAdminConfirm] =
    useState(false);

  const [adminLoading, setAdminLoading] =
    useState(false);

  // Delete admin
  const [deleteLoading, setDeleteLoading] =
    useState<string | null>(null);

  // Load current admin and admin list
  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    try {
      setLoadingAdmins(true);

      const [currentResponse, usersResponse] =
        await Promise.all([
          getCurrentAdmin(),
          getAdminUsers(),
        ]);

      setCurrentAdmin(currentResponse.admin);
      setAdmins(usersResponse.admins);
    } catch (error) {
      console.error(
        'Failed to load admin settings:',
        error
      );

      toast.show(
        error instanceof Error
          ? error.message
          : 'Failed to load admin information',
        'error'
      );
    } finally {
      setLoadingAdmins(false);
    }
  }

  const handleChangePassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      toast.show(
        'Please fill in all password fields',
        'warning'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.show(
        'New passwords do not match',
        'error'
      );
      return;
    }

    if (newPassword.length < 8) {
      toast.show(
        'Password must be at least 8 characters',
        'error'
      );
      return;
    }

    if (newPassword === currentPassword) {
      toast.show(
        'New password must be different from your current password',
        'warning'
      );
      return;
    }

    try {
      setPasswordLoading(true);

      await changeAdminPassword(
        currentPassword,
        newPassword
      );

      toast.show(
        'Password changed successfully',
        'success'
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(
        'Failed to change password:',
        error
      );

      toast.show(
        error instanceof Error
          ? error.message
          : 'Failed to change password',
        'error'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAddAdmin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const username = newUsername.trim();
    const email = newEmail.trim();

    if (!username || !email || !newAdminPassword) {
      toast.show(
        'Please fill in all admin fields',
        'warning'
      );
      return;
    }

    if (username.length < 3) {
      toast.show(
        'Username must be at least 3 characters',
        'error'
      );
      return;
    }

    if (newAdminPassword.length < 8) {
      toast.show(
        'Password must be at least 8 characters',
        'error'
      );
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      toast.show(
        'Admin passwords do not match',
        'error'
      );
      return;
    }

    try {
      setAdminLoading(true);

      const response = await createAdmin({
        username,
        email,
        password: newAdminPassword,
        role: 'admin',
      });

      setAdmins((current) => [
        ...current,
        response.admin,
      ]);

      toast.show(
        `Admin "${username}" added successfully`,
        'success'
      );

      setNewUsername('');
      setNewEmail('');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
    } catch (error) {
      console.error(
        'Failed to create admin:',
        error
      );

      toast.show(
        error instanceof Error
          ? error.message
          : 'Failed to create admin',
        'error'
      );
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteAdmin = async (
    admin: AdminUser
  ) => {
    if (admin.role === 'super') {
      toast.show(
        'Super admins cannot be removed',
        'warning'
      );
      return;
    }

    if (admin.id === currentAdmin?.id) {
      toast.show(
        'You cannot delete your own account',
        'warning'
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove "${admin.username}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(admin.id);

      await deleteAdmin(admin.id);

      setAdmins((current) =>
        current.filter(
          (item) => item.id !== admin.id
        )
      );

      toast.show(
        `Admin "${admin.username}" removed successfully`,
        'success'
      );
    } catch (error) {
      console.error(
        'Failed to delete admin:',
        error
      );

      toast.show(
        error instanceof Error
          ? error.message
          : 'Failed to remove admin',
        'error'
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const passwordMismatch =
    Boolean(newPassword) &&
    Boolean(confirmPassword) &&
    newPassword !== confirmPassword;

  const adminPasswordMismatch =
    Boolean(newAdminPassword) &&
    Boolean(confirmAdminPassword) &&
    newAdminPassword !== confirmAdminPassword;

  const isSuperAdmin =
    currentAdmin?.role === 'super';

  return (
    <div className="space-y-6">

      {/* Current account */}
      {currentAdmin && (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-cranberry text-white flex items-center justify-center font-bold">
              {currentAdmin.username
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold text-navy-800">
                Signed in as {currentAdmin.username}
              </p>

              <p className="text-xs text-navy-500">
                {currentAdmin.email}
              </p>
            </div>

            <Badge
              color={
                currentAdmin.role === 'super'
                  ? 'brand'
                  : 'navy'
              }
            >
              {currentAdmin.role === 'super'
                ? 'Super Admin'
                : 'Admin'}
            </Badge>
          </div>
        </div>
      )}

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
        <div className="px-5 lg:px-6 py-4 border-b border-navy-100 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center">
            <Lock className="w-5 h-5 text-navy-600" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-navy-800">
              Change Password
            </h2>

            <p className="text-xs text-navy-400">
              Update your admin account password
            </p>
          </div>
        </div>

        <form
          onSubmit={handleChangePassword}
          className="p-5 lg:p-6 space-y-4"
        >
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            onToggle={() =>
              setShowCurrent((value) => !value)
            }
            placeholder="Enter your current password"
          />

          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            onToggle={() =>
              setShowNew((value) => !value)
            }
            placeholder="At least 8 characters"
            error={
              newPassword &&
              newPassword.length < 8
                ? 'Password must be at least 8 characters'
                : undefined
            }
          />

          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            onToggle={() =>
              setShowConfirm((value) => !value)
            }
            placeholder="Re-enter new password"
            error={
              passwordMismatch
                ? 'Passwords do not match'
                : undefined
            }
          />

          {confirmPassword &&
            !passwordMismatch &&
            newPassword === confirmPassword && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                <Check className="w-4 h-4" />
                Passwords match
              </div>
            )}

          <div className="pt-2">
            <Button
              type="submit"
              loading={passwordLoading}
              icon={
                <KeyRound className="w-4 h-4" />
              }
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* Super Admin section */}
      {isSuperAdmin && (
        <>
          {/* Add New Admin */}
          <div className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
            <div className="px-5 lg:px-6 py-4 border-b border-navy-100 flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-brand-cranberry" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-navy-800">
                  Add New Admin
                </h2>

                <p className="text-xs text-navy-400">
                  Grant admin access to a new team member
                </p>
              </div>
            </div>

            <form
              onSubmit={handleAddAdmin}
              className="p-5 lg:p-6 space-y-4"
            >
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />

                <div>
                  <p className="text-sm font-bold text-amber-700">
                    Authorization Warning
                  </p>

                  <p className="text-xs text-amber-600 mt-0.5">
                    New admins will have access to
                    orders, payments, products, and
                    campaigns. Only grant access to
                    trusted Rotaract members.
                  </p>
                </div>
              </div>

              <Input
                label="New Admin Username"
                value={newUsername}
                onChange={(e) =>
                  setNewUsername(e.target.value)
                }
                placeholder="e.g. merch_coordinator"
              />

              <Input
                label="Email Address"
                type="email"
                value={newEmail}
                onChange={(e) =>
                  setNewEmail(e.target.value)
                }
                placeholder="e.g. coordinator@example.com"
              />

              <PasswordInput
                label="Password"
                value={newAdminPassword}
                onChange={setNewAdminPassword}
                show={showAdminPassword}
                onToggle={() =>
                  setShowAdminPassword(
                    (value) => !value
                  )
                }
                placeholder="At least 8 characters"
                error={
                  newAdminPassword &&
                  newAdminPassword.length < 8
                    ? 'Password must be at least 8 characters'
                    : undefined
                }
              />

              <PasswordInput
                label="Confirm Password"
                value={confirmAdminPassword}
                onChange={setConfirmAdminPassword}
                show={showAdminConfirm}
                onToggle={() =>
                  setShowAdminConfirm(
                    (value) => !value
                  )
                }
                placeholder="Re-enter password"
                error={
                  adminPasswordMismatch
                    ? 'Passwords do not match'
                    : undefined
                }
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  loading={adminLoading}
                  icon={
                    <UserPlus className="w-4 h-4" />
                  }
                >
                  Add Admin Account
                </Button>
              </div>
            </form>
          </div>

          {/* Existing Admins */}
          <div className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
            <div className="px-5 lg:px-6 py-4 border-b border-navy-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-navy-600" />

                <div>
                  <h2 className="text-sm font-bold text-navy-800">
                    Existing Admin Accounts
                  </h2>

                  <p className="text-xs text-navy-400">
                    Manage administrator access
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadAdminData}
                disabled={loadingAdmins}
                className="p-2 rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-700 transition disabled:opacity-50"
                title="Refresh admin list"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    loadingAdmins
                      ? 'animate-spin'
                      : ''
                  }`}
                />
              </button>
            </div>

            {loadingAdmins ? (
              <div className="p-8 text-center text-sm text-navy-400">
                Loading admin accounts...
              </div>
            ) : admins.length === 0 ? (
              <div className="p-8 text-center text-sm text-navy-400">
                No admin accounts found.
              </div>
            ) : (
              <div className="divide-y divide-navy-50">
                {admins.map((admin) => {
                  const deleting =
                    deleteLoading === admin.id;

                  const isCurrentAdmin =
                    admin.id === currentAdmin?.id;

                  return (
                    <div
                      key={admin.id}
                      className="flex items-center justify-between px-5 lg:px-6 py-4 gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {admin.username
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-navy-800 text-sm">
                              {admin.username}
                            </p>

                            {isCurrentAdmin && (
                              <Badge color="emerald">
                                You
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-navy-400 truncate">
                            {admin.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge
                          color={
                            admin.role === 'super'
                              ? 'brand'
                              : 'navy'
                          }
                        >
                          {admin.role === 'super'
                            ? 'Super Admin'
                            : 'Admin'}
                        </Badge>

                        {admin.role !== 'super' &&
                          !isCurrentAdmin && (
                            <button
                              type="button"
                              disabled={deleting}
                              onClick={() =>
                                handleDeleteAdmin(
                                  admin
                                )
                              }
                              className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition disabled:opacity-50"
                              title="Remove admin"
                            >
                              <Trash2
                                className={`w-4 h-4 ${
                                  deleting
                                    ? 'animate-pulse'
                                    : ''
                                }`}
                              />
                            </button>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {!isSuperAdmin && currentAdmin && (
        <div className="bg-navy-50 border border-navy-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-navy-500 shrink-0 mt-0.5" />

            <div>
              <p className="text-sm font-bold text-navy-700">
                Administrator permissions
              </p>

              <p className="text-xs text-navy-500 mt-1">
                Admin account management is restricted
                to Super Admins. You can still change
                your own password.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
  error?: string;
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  error,
}: PasswordInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-navy-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-11 rounded-xl border-2 transition-colors text-navy-800 placeholder:text-navy-300 outline-none ${
            error
              ? 'border-red-300 focus:border-red-400'
              : 'border-navy-200 focus:border-brand-cranberry'
          }`}
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-500 transition"
          aria-label={
            show
              ? 'Hide password'
              : 'Show password'
          }
        >
          {show ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}