import {
  ShoppingCart,
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
  Package,
} from 'lucide-react';
import type { Order, Product } from '@/types';
import { Badge, ProgressBar } from '@/components/ui/Button';
import { statusColors } from '@/data/mockData';

interface DashboardProps {
  orders: Order[];
  products: Product[];
}

export function Dashboard({ orders, products }: DashboardProps) {
  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalPaid = orders.filter((o) => o.status === 'Paid' || o.status === 'Confirmed' || o.status === 'Production' || o.status === 'Ready' || o.status === 'Delivered').reduce((sum, o) => sum + o.total, 0);
  const pendingPayments = orders.filter((o) => o.status === 'Awaiting Payment' || o.status === 'Proof Uploaded').length;

  const kpis = [
    {
      label: 'Total Orders',
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: '+12%',
    },
    {
      label: 'Total Sales',
      value: `${totalSales.toLocaleString()} ETB`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: '+8%',
    },
    {
      label: 'Total Paid',
      value: `${totalPaid.toLocaleString()} ETB`,
      icon: CheckCircle2,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      trend: '+15%',
    },
    {
      label: 'Pending Payments',
      value: pendingPayments.toString(),
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: '-3%',
    },
  ];

  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const activeProducts = products.filter((p) => p.active);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-2xl border border-navy-100 p-4 lg:p-5 shadow-soft hover:shadow-card transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <span className={`text-xs font-bold flex items-center gap-0.5 ${kpi.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-400'}`}>
                  <TrendingUp className="w-3 h-3" /> {kpi.trend}
                </span>
              </div>
              <p className="text-xs text-navy-400 font-semibold mb-0.5">{kpi.label}</p>
              <p className="text-lg lg:text-2xl font-extrabold text-navy-800">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Product Pre-order Targets */}
      <div className="bg-white rounded-2xl border border-navy-100 p-5 lg:p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-5">
          <Package className="w-5 h-5 text-brand-cranberry" />
          <h2 className="text-base font-bold text-navy-800">Pre-order Targets</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeProducts.map((p) => (
            <div key={p.id} className="flex items-start gap-3">
              <img src={p.image} alt={p.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-navy-800 truncate">{p.title}</h3>
                <p className="text-xs text-navy-400 mb-2">{p.category} · {p.price.toLocaleString()} ETB</p>
                <ProgressBar value={p.currentOrders} max={p.target} label="Pre-orders" showValue />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
        <div className="px-5 lg:px-6 py-4 border-b border-navy-100">
          <h2 className="text-base font-bold text-navy-800">Recent Orders</h2>
        </div>
        <div className="divide-y divide-navy-50">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between px-5 lg:px-6 py-4 hover:bg-navy-50/50 transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5 text-navy-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-navy-800 text-sm truncate">{order.orderNumber}</p>
                  <p className="text-xs text-navy-400 truncate">{order.customerName} · {order.items.length} item(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-navy-700 text-sm hidden sm:block">{order.total.toLocaleString()} ETB</span>
                <Badge color={
                  order.status === 'Awaiting Payment' ? 'amber' :
                  order.status === 'Proof Uploaded' ? 'blue' :
                  order.status === 'Paid' ? 'emerald' :
                  order.status === 'Confirmed' ? 'teal' :
                  order.status === 'Production' ? 'purple' :
                  order.status === 'Ready' ? 'cyan' : 'gray'
                }>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusColors[order.status].dot}`} />
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
