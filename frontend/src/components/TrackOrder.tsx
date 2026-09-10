import { useState } from 'react';
import { Search, Package, PackageSearch, Clock, CheckCircle2, Truck, PackageCheck, XCircle } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';
import { orders, statusColors, statusOrder } from '@/data/mockData';
import { Badge } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

const statusIcons: Record<OrderStatus, typeof Clock> = {
  'Awaiting Payment': Clock,
  'Proof Uploaded': PackageSearch,
  'Paid': CheckCircle2,
  'Confirmed': PackageCheck,
  'Production': Package,
  'Ready': PackageCheck,
  'Delivered': Truck,
};

export function TrackOrder() {
  const toast = useToast();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<Order | null | 'not_found'>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      toast.show('Please enter both order number and phone number', 'warning');
      return;
    }
    const found = orders.find(
      (o) => o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase() && o.phone === phone.trim()
    );
    setResult(found || 'not_found');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
          <PackageSearch className="w-8 h-8 text-brand-cranberry" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-navy-800 mb-2">Track Your Order</h1>
        <p className="text-navy-400">Enter your order number and phone number to check your order status.</p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-navy-100 shadow-card p-5 lg:p-6 mb-6">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-bold text-navy-700 mb-2 block">Order Number</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300" />
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. DEBO-0042"
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-navy-200 focus:border-brand-cranberry outline-none text-navy-800 placeholder:text-navy-300 transition uppercase font-semibold"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-navy-700 mb-2 block">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0912345678"
              className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:border-brand-cranberry outline-none text-navy-800 placeholder:text-navy-300 transition"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-brand-cranberry text-white font-bold text-sm hover:bg-brand-600 transition-all shadow-soft hover:shadow-card flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" /> Track Order
        </button>
      </form>

      {/* Empty state */}
      {result === null && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-navy-50 flex items-center justify-center mb-4">
            <Package className="w-10 h-10 text-navy-300" />
          </div>
          <h3 className="text-lg font-bold text-navy-600">Enter your details above</h3>
          <p className="text-sm text-navy-400 mt-1">Your order status will appear here.</p>
        </div>
      )}

      {/* Not found */}
      {result === 'not_found' && (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-red-50 rounded-2xl border border-red-100">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-red-700">Order Not Found</h3>
          <p className="text-sm text-red-400 mt-1">Check your order number and phone number and try again.</p>
        </div>
      )}

      {/* Order found */}
      {result && result !== 'not_found' && (
        <div className="bg-white rounded-2xl border border-navy-100 shadow-card p-5 lg:p-6 animate-slide-up">
          {/* Order header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-5 border-b border-navy-100">
            <div>
              <p className="text-xs text-navy-400 font-semibold uppercase tracking-wide">Order Number</p>
              <p className="text-2xl font-extrabold text-navy-800">{result.orderNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${statusColors[result.status].dot} animate-pulse`} />
              <Badge color={
                result.status === 'Awaiting Payment' ? 'amber' :
                result.status === 'Proof Uploaded' ? 'blue' :
                result.status === 'Paid' ? 'emerald' :
                result.status === 'Confirmed' ? 'teal' :
                result.status === 'Production' ? 'purple' :
                result.status === 'Ready' ? 'cyan' : 'gray'
              }>
                {result.status}
              </Badge>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 mb-5">
            {result.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-4 bg-navy-50 rounded-xl">
                <div>
                  <p className="font-semibold text-navy-800 text-sm">{item.productTitle}</p>
                  <p className="text-xs text-navy-400">{item.color} · {item.size} · Qty {item.quantity}</p>
                </div>
                <span className="font-bold text-navy-700 text-sm">{(item.unitPrice * item.quantity).toLocaleString()} ETB</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center py-3 border-t border-navy-100 mb-5">
            <span className="font-bold text-navy-700">Total</span>
            <span className="text-xl font-extrabold text-brand-cranberry">{result.total.toLocaleString()} ETB</span>
          </div>

          {/* Status timeline */}
          <div>
            <h3 className="text-sm font-bold text-navy-700 mb-4">Order Progress</h3>
            <div className="space-y-0">
              {statusOrder.map((status, i) => {
                const Icon = statusIcons[status];
                const currentIdx = statusOrder.indexOf(result.status);
                const done = i <= currentIdx;
                const isLast = i === statusOrder.length - 1;
                return (
                  <div key={status} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${done ? 'bg-brand-cranberry text-white' : 'bg-navy-100 text-navy-300'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-8 ${i < currentIdx ? 'bg-brand-cranberry' : 'bg-navy-100'}`} />
                      )}
                    </div>
                    <div className="pt-1.5 pb-2">
                      <p className={`text-sm font-semibold ${done ? 'text-navy-800' : 'text-navy-300'}`}>{status}</p>
                      {i === currentIdx && (
                        <p className="text-xs text-brand-cranberry font-medium mt-0.5">Current status</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
