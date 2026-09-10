import { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderOpen,
  Factory,
  Settings,
  Menu,
  X,
  LogOut,
  Heart,
} from 'lucide-react';
import type { AdminTab } from '@/types';
import { Dashboard } from '@/components/admin/Dashboard';
import { OrdersManagement } from '@/components/admin/OrdersManagement';
import { ProductManager } from '@/components/admin/ProductManager';
import { CampaignManagement } from '@/components/admin/CampaignManagement';
import { ProductionReport } from '@/components/admin/ProductionReport';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { products, orders, campaigns } from '@/data/mockData';

interface AdminPortalProps {
  onLogout: () => void;
}

const navItems: { tab: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { tab: 'orders', label: 'Orders', icon: ShoppingCart },
  { tab: 'products', label: 'Products', icon: Package },
  { tab: 'campaigns', label: 'Campaigns', icon: FolderOpen },
  { tab: 'production', label: 'Production Report', icon: Factory },
  { tab: 'settings', label: 'Settings', icon: Settings },
];

export function AdminPortal({ onLogout }: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const currentNav = navItems.find((n) => n.tab === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard orders={orders} products={products} />;
      case 'orders':
        return <OrdersManagement orders={orders} />;
      case 'products':
        return <ProductManager products={products} />;
      case 'campaigns':
        return <CampaignManagement campaigns={campaigns} />;
      case 'production':
        return <ProductionReport orders={orders} products={products} />;
      case 'settings':
        return <AdminSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-navy-100 flex-col fixed left-0 top-20 bottom-0 z-30">
        <SidebarContent activeTab={activeTab} onTabChange={handleTabChange} onLogout={onLogout} />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-white shadow-float h-full flex flex-col animate-slide-in-right">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-lg hover:bg-navy-50 text-navy-400"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent activeTab={activeTab} onTabChange={handleTabChange} onLogout={onLogout} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-16 z-20 bg-white border-b border-navy-100 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2.5 rounded-xl hover:bg-navy-50 transition text-navy-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-navy-800 text-sm">{currentNav?.label}</span>
          <div className="w-11" />
        </div>

        {/* Content area */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Page header */}
          <div className="mb-6 hidden lg:block">
            <h1 className="text-2xl font-extrabold text-navy-800">{currentNav?.label}</h1>
            <p className="text-sm text-navy-400 mt-0.5">
              {activeTab === 'dashboard' && 'Overview of your store performance and key metrics.'}
              {activeTab === 'orders' && 'Manage and track all customer orders.'}
              {activeTab === 'products' && 'Add, edit, and manage your merchandise products.'}
              {activeTab === 'campaigns' && 'Start, archive, and switch between campaigns.'}
              {activeTab === 'production' && 'Print-ready breakdown for your manufacturer.'}
              {activeTab === 'settings' && 'Manage admin accounts and security settings.'}
            </p>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
}

function SidebarContent({ activeTab, onTabChange, onLogout }: SidebarContentProps) {
  return (
    <>
      <div className="px-4 py-5 border-b border-navy-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cranberry to-brand-700 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <p className="font-bold text-navy-800 text-sm leading-tight">Debo Admin</p>
            <p className="text-xs text-navy-400">Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto scroll-thin">
        <p className="px-3 mb-2 text-xs font-bold text-navy-300 uppercase tracking-wide">Management</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm transition-all w-full mb-1 min-h-[44px] ${
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-navy-500 hover:bg-navy-50 hover:text-navy-700'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-cranberry" />}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-navy-100">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm text-red-500 hover:bg-red-50 transition-all w-full min-h-[44px]"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </>
  );
}
