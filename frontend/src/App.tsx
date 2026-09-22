import { useEffect, useState } from 'react';
import type { View } from '@/types';

import { ToastProvider } from '@/components/ui/Toast';
import { Header } from '@/components/Header';
import { Shop } from '@/components/Shop';
import { TrackOrder } from '@/components/TrackOrder';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminPortal } from '@/components/admin/AdminPortal';

import {
  getAdminToken,
  getCurrentAdmin,
  adminLogout,
} from '@/api';

import rotaractLogo from '@/assets/logo.png';

function getViewFromPath(): View {
  const path = window.location.pathname;

  if (path === '/admin') {
    return 'admin';
  }

  if (path === '/track') {
    return 'track';
  }

  return 'shop';
}

function App() {
  const [view, setView] = useState<View>(
    getViewFromPath()
  );

  const [adminLoggedIn, setAdminLoggedIn] =
    useState(false);

  const [checkingAdmin, setCheckingAdmin] =
    useState(false);

  /*
   * Restore admin session when /admin is opened.
   */
  useEffect(() => {
    if (view !== 'admin') {
      setCheckingAdmin(false);
      return;
    }

    const token = getAdminToken();

    if (!token) {
      setAdminLoggedIn(false);
      setCheckingAdmin(false);
      return;
    }

    let cancelled = false;

    const verifyAdminSession = async () => {
      try {
        setCheckingAdmin(true);

        await getCurrentAdmin();

        if (!cancelled) {
          setAdminLoggedIn(true);
        }
      } catch (error) {
        console.error(
          'Admin session verification failed:',
          error
        );

        if (!cancelled) {
          setAdminLoggedIn(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingAdmin(false);
        }
      }
    };

    verifyAdminSession();

    return () => {
      cancelled = true;
    };
  }, [view]);

  /*
   * Handle browser back/forward buttons.
   */
  useEffect(() => {
    const handlePopState = () => {
      setView(getViewFromPath());
    };

    window.addEventListener(
      'popstate',
      handlePopState
    );

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      );
    };
  }, []);

  /*
   * Navigate between public pages and /admin.
   */
  const handleViewChange = (nextView: View) => {
    let path = '/';

    if (nextView === 'track') {
      path = '/track';
    }

    if (nextView === 'admin') {
      path = '/admin';
    }

    window.history.pushState({}, '', path);

    setView(nextView);
  };

  /*
   * Successful admin login.
   */
  const handleAdminLogin = () => {
    setAdminLoggedIn(true);
  };

  /*
   * Admin logout.
   */
  const handleAdminLogout = () => {
    adminLogout();

    setAdminLoggedIn(false);

    window.history.pushState({}, '', '/');

    setView('shop');
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-white flex flex-col">
        {/*
         * Do not show the public header while inside
         * the admin portal.
         */}
        {view !== 'admin' && (
          <Header
            view={view}
            onViewChange={handleViewChange}
          />
        )}

        <main className="flex-1">
          {view === 'shop' && <Shop />}

          {view === 'track' && <TrackOrder />}

          {view === 'admin' && checkingAdmin && (
            <div className="min-h-screen flex items-center justify-center bg-navy-50">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-brand-cranberry border-t-transparent rounded-full animate-spin mx-auto mb-4" />

                <p className="text-sm font-semibold text-navy-600">
                  Checking admin session...
                </p>
              </div>
            </div>
          )}

          {view === 'admin' &&
            !checkingAdmin &&
            !adminLoggedIn && (
              <AdminLogin
                onLogin={handleAdminLogin}
              />
            )}

          {view === 'admin' &&
            !checkingAdmin &&
            adminLoggedIn && (
              <AdminPortal
                onLogout={handleAdminLogout}
              />
            )}
        </main>

        {/*
         * Keep the public footer away from the admin portal.
         */}
        {view !== 'admin' && (
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
                    <p className="text-sm font-bold text-white">
                      Rotaract Club of Debo
                    </p>

                    <p className="text-xs text-navy-400">
                      Merchandise Pre-Order System
                    </p>
                  </div>
                </div>

                <p className="text-xs text-navy-400 text-center sm:text-right">
                  Fundraising for community projects · Every purchase makes a difference
                </p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </ToastProvider>
  );
}

export default App;