import { useEffect, useState } from 'react';
import {
  ShoppingCart,
  DollarSign,
  CheckCircle2,
  Clock,
  Package,
  RefreshCw,
} from 'lucide-react';

import type { Order, Product } from '@/types';
import { Badge, Button, ProgressBar } from '@/components/ui/Button';
import { getAdminToken, getDashboardStats, getProducts } from '@/api';

interface DashboardProps {
  orders?: Order[];
  products?: Product[];
  onLogout?: () => void;
}

interface DashboardData {
  totalOrders: number;
  totalSales: number;
  totalPaid: number;
  pendingPayments: number;
  recentOrders: Order[];
}

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'Awaiting Payment':
      return 'amber';
    case 'Proof Uploaded':
      return 'blue';
    case 'Paid':
      return 'emerald';
    case 'Confirmed':
      return 'teal';
    case 'Production':
      return 'purple';
    case 'Ready':
      return 'cyan';
    case 'Delivered':
      return 'gray';
    default:
      return 'gray';
  }
};

export function Dashboard({ onLogout }: DashboardProps) {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const [dashboardData, productData] = await Promise.all([
        getDashboardStats(),
        getProducts(true),
      ]);

      setStats(dashboardData);
      setProducts(productData.products);
    } catch (err) {
      if (!getAdminToken()) {
        onLogout?.();
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load dashboard data'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-navy-200 border-t-brand-cranberry rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-navy-500">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-red-500" />
          </div>

          <h2 className="text-lg font-bold text-navy-800 mb-2">
            Unable to load dashboard
          </h2>

          <p className="text-sm text-navy-500 mb-5">
            {error || 'Dashboard data is unavailable.'}
          </p>

          <Button
            onClick={() => loadDashboard()}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Sales',
      value: `${stats.totalSales.toLocaleString()} ETB`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Total Paid',
      value: `${stats.totalPaid.toLocaleString()} ETB`,
      icon: CheckCircle2,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      label: 'Pending Payments',
      value: stats.pendingPayments.toLocaleString(),
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  const activeProducts = products.filter((product) => product.active);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-navy-800">
            Dashboard
          </h1>
          <p className="text-sm text-navy-400 mt-1">
            Live information from your fundraising system
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
          icon={
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            />
          }
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl border border-navy-100 p-4 lg:p-5 shadow-soft hover:shadow-card transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 lg:w-11 lg:h-11 rounded-xl ${kpi.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>

              <p className="text-xs text-navy-400 font-semibold mb-0.5">
                {kpi.label}
              </p>

              <p className="text-lg lg:text-2xl font-extrabold text-navy-800">
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Product Pre-order Targets */}
      <div className="bg-white rounded-2xl border border-navy-100 p-5 lg:p-6 shadow-soft">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-cranberry" />

            <h2 className="text-base font-bold text-navy-800">
              Pre-order Targets
            </h2>
          </div>

          <span className="text-xs font-semibold text-navy-400">
            {activeProducts.length} active product
            {activeProducts.length === 1 ? '' : 's'}
          </span>
        </div>

        {activeProducts.length === 0 ? (
          <div className="py-8 text-center">
            <Package className="w-8 h-8 text-navy-200 mx-auto mb-2" />

            <p className="text-sm font-semibold text-navy-500">
              No active products
            </p>

            <p className="text-xs text-navy-400 mt-1">
              Add a product to see its pre-order target here.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-start gap-3"
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-navy-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-navy-800 truncate">
                    {product.title}
                  </h3>

                  <p className="text-xs text-navy-400 mb-2">
                    {product.category} ·{' '}
                    {product.price.toLocaleString()} ETB
                  </p>

                  <ProgressBar
                    value={product.currentOrders}
                    max={product.target}
                    label="Pre-orders"
                    showValue
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
        <div className="px-5 lg:px-6 py-4 border-b border-navy-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-800">
              Recent Orders
            </h2>

            <p className="text-xs text-navy-400 mt-0.5">
              Latest orders received by the system
            </p>
          </div>

          <span className="text-xs font-semibold text-navy-400">
            {stats.recentOrders.length} shown
          </span>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="py-10 text-center">
            <ShoppingCart className="w-8 h-8 text-navy-200 mx-auto mb-2" />

            <p className="text-sm font-semibold text-navy-500">
              No orders yet
            </p>

            <p className="text-xs text-navy-400 mt-1">
              New customer orders will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-navy-50">
            {stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-5 lg:px-6 py-4 hover:bg-navy-50/50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-5 h-5 text-navy-400" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-navy-800 text-sm truncate">
                      {order.orderNumber}
                    </p>

                    <p className="text-xs text-navy-400 truncate">
                      {order.customerName} · {order.items.length} item(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-navy-700 text-sm hidden sm:block">
                    {order.total.toLocaleString()} ETB
                  </span>

                  <Badge color={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}