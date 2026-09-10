import { useState } from 'react';
import { Lock, UserPlus, Shield, AlertTriangle, Check, Eye, EyeOff, KeyRound, Trash2 } from 'lucide-react';
import { Badge, Button, Input } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { adminUsers } from '@/data/mockData';

export function AdminSettings() {
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Add admin form
  const [newUsername, setNewUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.show('Please fill in all fields', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.show('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 8) {
      toast.show('Password must be at least 8 characters', 'error');
      return;
    }
    toast.show('Password changed successfully', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newAdminPassword || !confirmAdminPassword) {
      toast.show('Please fill in all fields', 'warning');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      toast.show('Passwords do not match', 'error');
      return;
    }
    toast.show(`Admin "${newUsername}" added successfully`, 'success');
    setNewUsername('');
    setNewAdminPassword('');
    setConfirmAdminPassword('');
  };

  const passwordMismatch = newPassword && confirmPassword && newPassword !== confirmPassword;
  const adminPasswordMismatch = newAdminPassword && confirmAdminPassword && newAdminPassword !== confirmAdminPassword;

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
        <div className="px-5 lg:px-6 py-4 border-b border-navy-100 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center">
            <Lock className="w-5 h-5 text-navy-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-navy-800">Change Password</h2>
            <p className="text-xs text-navy-400">Update your admin account password</p>
          </div>
        </div>
        <form onSubmit={handleChangePassword} className="p-5 lg:p-6 space-y-4">
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            onToggle={() => setShowCurrent(!showCurrent)}
            placeholder="Enter your current password"
          />
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            onToggle={() => setShowNew(!showNew)}
            placeholder="At least 8 characters"
            error={newPassword && newPassword.length < 8 ? 'Password must be at least 8 characters' : undefined}
          />
          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
            placeholder="Re-enter new password"
            error={passwordMismatch ? 'Passwords do not match' : undefined}
          />
          {confirmPassword && !passwordMismatch && newPassword === confirmPassword && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <Check className="w-4 h-4" /> Passwords match
            </div>
          )}
          <div className="pt-2">
            <Button type="submit" icon={<KeyRound className="w-4 h-4" />}>Update Password</Button>
          </div>
        </form>
      </div>

      {/* Add New Admin */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
        <div className="px-5 lg:px-6 py-4 border-b border-navy-100 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-brand-cranberry" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-navy-800">Add New Admin</h2>
            <p className="text-xs text-navy-400">Grant admin access to a new team member</p>
          </div>
        </div>
        <form onSubmit={handleAddAdmin} className="p-5 lg:p-6 space-y-4">
          {/* Warning badge */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-700">Authorization Warning</p>
              <p className="text-xs text-amber-600 mt-0.5">
                New admins will have full access to orders, payments, products, and campaigns. Only grant access to trusted Rotaract members.
              </p>
            </div>
          </div>

          <Input
            label="New Admin Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="e.g. merch_coordinator"
          />
          <PasswordInput
            label="Password"
            value={newAdminPassword}
            onChange={setNewAdminPassword}
            show={false}
            onToggle={() => {}}
            placeholder="Create a secure password"
            error={adminPasswordMismatch ? undefined : undefined}
          />
          <PasswordInput
            label="Confirm Password"
            value={confirmAdminPassword}
            onChange={setConfirmAdminPassword}
            show={false}
            onToggle={() => {}}
            placeholder="Re-enter password"
            error={adminPasswordMismatch ? 'Passwords do not match' : undefined}
          />
          <div className="pt-2">
            <Button type="submit" icon={<UserPlus className="w-4 h-4" />}>Add Admin Account</Button>
          </div>
        </form>
      </div>

      {/* Existing Admins */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
        <div className="px-5 lg:px-6 py-4 border-b border-navy-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-navy-600" />
          <h2 className="text-sm font-bold text-navy-800">Existing Admin Accounts</h2>
        </div>
        <div className="divide-y divide-navy-50">
          {adminUsers.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between px-5 lg:px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center text-white font-bold text-sm">
                  {admin.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-navy-800 text-sm">{admin.username}</p>
                  <p className="text-xs text-navy-400">{admin.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge color={admin.role === 'super' ? 'brand' : 'navy'}>
                  {admin.role === 'super' ? 'Super Admin' : 'Admin'}
                </Badge>
                {admin.role !== 'super' && (
                  <button
                    onClick={() => toast.show(`Admin "${admin.username}" removed`, 'info')}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
  error?: string;
}

function PasswordInput({ label, value, onChange, show, onToggle, placeholder, error }: PasswordInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-navy-700">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-11 rounded-xl border-2 transition-colors text-navy-800 placeholder:text-navy-300 outline-none ${
            error ? 'border-red-300 focus:border-red-400' : 'border-navy-200 focus:border-brand-cranberry'
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-500 transition"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
