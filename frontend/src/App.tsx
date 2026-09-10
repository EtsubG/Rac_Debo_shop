import { useState } from 'react';
import type { View } from '@/types';
import { ToastProvider } from '@/components/ui/Toast';
import { Header } from '@/components/Header';
import { Shop } from '@/components/Shop';
import { TrackOrder } from '@/components/TrackOrder';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminPortal } from '@/components/admin/AdminPortal';

function App() {
  const [view, setView] = useState<View>('shop');
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <Header view={view} onViewChange={setView} />

        <main className="flex-1">
          {view === 'shop' && <Shop />}
          {view === 'track' && <TrackOrder />}
          {view === 'admin' && !adminLoggedIn && <AdminLogin onLogin={() => setAdminLoggedIn(true)} />}
          {view === 'admin' && adminLoggedIn && <AdminPortal onLogout={() => setAdminLoggedIn(false)} />}
        </main>

        <footer className="bg-navy-800 text-navy-300 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Rotaract Club of Debo</p>
                  <p className="text-xs text-navy-400">Merchandise Pre-Order System</p>
                </div>
              </div>
              <p className="text-xs text-navy-400 text-center sm:text-right">
                Fundraising for community projects · Every purchase makes a difference
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}

export default App;
