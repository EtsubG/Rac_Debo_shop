import { useState } from 'react';
import type { View } from '@/types';
import { ToastProvider } from '@/components/ui/Toast';
import { Header } from '@/components/Header';
import { Shop } from '@/components/Shop';
import { TrackOrder } from '@/components/TrackOrder';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminPortal } from '@/components/admin/AdminPortal';
import rotaractLogo from '@/assets/logo.png';
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
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                  <img
                    src={rotaractLogo}
                    alt="Rotaract Club of Debo"
                    className="w-full h-full object-contain"
                  />
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
