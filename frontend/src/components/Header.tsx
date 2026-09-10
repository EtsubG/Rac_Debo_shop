import { useState } from 'react';
import { Menu, X, ShoppingBag, PackageSearch, Shield } from 'lucide-react';
import type { View } from '@/types';
import rotaractLogo from '@/assets/logo.png';

interface HeaderProps {
  view: View;
  onViewChange: (view: View) => void;
}

const navItems: { label: string; view: View; icon: typeof ShoppingBag }[] = [
  { label: 'Home / Shop', view: 'shop', icon: ShoppingBag },
  { label: 'Track Order', view: 'track', icon: PackageSearch },
  { label: 'Admin Portal', view: 'admin', icon: Shield },
];

export function Header({ view, onViewChange }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (v: View) => {
    onViewChange(v);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-navy-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo + Brand */}
          <button onClick={() => handleNav('shop')} className="flex items-center gap-3 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl overflow-hidden shadow-soft group-hover:shadow-card transition-all">
              <img
                src={rotaractLogo}
                alt="Rotaract Club of Debo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <h1 className="text-sm lg:text-lg font-extrabold text-navy-800 leading-tight tracking-tight">
                Rotaract Club of Debo
              </h1>
              <p className="text-[10px] lg:text-xs text-navy-400 font-medium leading-tight">
                Merchandise Pre-Order System
              </p>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => handleNav(item.view)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-navy-500 hover:bg-navy-50 hover:text-navy-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2.5 rounded-xl hover:bg-navy-50 transition text-navy-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-navy-100 bg-white animate-slide-up">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => handleNav(item.view)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all min-h-[44px] ${
                    active ? 'bg-brand-50 text-brand-700' : 'text-navy-600 hover:bg-navy-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
