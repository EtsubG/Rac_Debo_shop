import { useState } from 'react';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';
import { Button, Input } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.show('Please enter both username and password', 'warning');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
      toast.show('Welcome back, Admin!', 'success');
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-10 bg-gradient-to-br from-navy-50 via-white to-brand-50/30">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-float border border-navy-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-navy-800 to-navy-900 p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-white mb-1">Admin Portal</h1>
            <p className="text-sm text-navy-300">Sign in to manage orders and campaigns</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-4">
            <div>
              <label className="text-sm font-bold text-navy-700 mb-2 block">Username or Email</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@deboclub.org"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-navy-200 focus:border-brand-cranberry outline-none text-navy-800 placeholder:text-navy-300 transition"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-navy-700 mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-navy-200 focus:border-brand-cranberry outline-none text-navy-800 placeholder:text-navy-300 transition"
                />
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading} icon={!loading ? <ArrowRight className="w-5 h-5" /> : undefined}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="flex items-center gap-2 justify-center pt-2">
              <Heart className="w-4 h-4 text-brand-cranberry fill-brand-cranberry" />
              <span className="text-xs text-navy-400 font-medium">Rotaract Club of Debo</span>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-navy-400 mt-4">
          Demo mode — enter any credentials to access the admin portal.
        </p>
      </div>
    </div>
  );
}
