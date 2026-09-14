import { useState } from 'react';
import {
  Search,
  Package,
  PackageSearch,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
} from 'lucide-react';

import type { Order, OrderStatus } from '@/types';
import { trackOrder } from '@/api';
import { Badge } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

const statusColors: Record<
  OrderStatus,
  { bg: string; text: string; dot: string }
> = {
  'Awaiting Payment': {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  'Proof Uploaded': {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  Paid: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  Confirmed: {
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    dot: 'bg-teal-500',
  },
  Production: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
  },
  Ready: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    dot: 'bg-cyan-500',
  },
  Delivered: {
    bg: 'bg-gray-200',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
};

const statusOrder: OrderStatus[] = [
  'Awaiting Payment',
  'Proof Uploaded',
  'Paid',
  'Confirmed',
  'Production',
  'Ready',
  'Delivered',
];

const statusIcons: Record<OrderStatus, typeof Clock> = {
  'Awaiting Payment': Clock,
  'Proof Uploaded': PackageSearch,
  Paid: CheckCircle2,
  Confirmed: PackageCheck,
  Production: Package,
  Ready: PackageCheck,
  Delivered: Truck,
};

export function TrackOrder() {
  const toast = useToast();

  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');

  const [result, setResult] = useState<
    Order | null | 'not_found'
  >(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanOrderNumber = orderNumber.trim();
    const cleanPhone = phone.trim();

    if (!cleanOrderNumber || !cleanPhone) {
      toast.show(
        'Please enter both order number and phone number',
        'warning'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await trackOrder(
        cleanOrderNumber,
        cleanPhone
      );

      setResult(response.order);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to find your order';

      if (
        message.toLowerCase().includes('order not found')
      ) {
        setResult('not_found');
        setError(null);
      } else {
        setError(message);
        setResult(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
          <PackageSearch className="w-8 h-8 text-brand-cranberry" />
        </div>

        <h1 className="text-2xl lg:text-3xl font-extrabold text-navy-800 mb-2">
          Track Your Order
        </h1>

        <p className="text-navy-400">
          Enter your order number and phone number to check
          your order status.
        </p>
      </div>

      {/* Search form */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-2xl border border-navy-100 shadow-card p-5 lg:p-6 mb-6"
      >
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-bold text-navy-700 mb-2 block">
              Order Number
            </label>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300" />

              <input
                value={orderNumber}
                onChange={(e) =>
                  setOrderNumber(e.target.value)
                }
                placeholder="e.g. DEBO-0042"
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-navy-200 focus:border-brand-cranberry outline-none text-navy-800 placeholder:text-navy-300 transition uppercase font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-navy-700 mb-2 block">
              Phone Number
            </label>

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
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-brand-cranberry text-white font-bold text-sm hover:bg-brand-600 transition-all shadow-soft hover:shadow-card flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Track Order
            </>
          )}
        </button>
      </form>

      {/* General error */}
      {error && (
        <div className="flex flex-col items-center justify-center py-10 text-center bg-red-50 rounded-2xl border border-red-100">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>

          <h3 className="text-lg font-bold text-red-700">
            Something went wrong
          </h3>

          <p className="text-sm text-red-500 mt-1 px-4">
            {error}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading &&
        !error &&
        result === null && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-navy-50 flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-navy-300" />
            </div>

            <h3 className="text-lg font-bold text-navy-600">
              Enter your details above
            </h3>

            <p className="text-sm text-navy-400 mt-1">
              Your order status will appear here.
            </p>
          </div>
        )}

      {/* Not found */}
      {!loading &&
        !error &&
        result === 'not_found' && (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-red-50 rounded-2xl border border-red-100">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>

            <h3 className="text-lg font-bold text-red-700">
              Order Not Found
            </h3>

            <p className="text-sm text-red-400 mt-1">
              Check your order number and phone number and try
              again.
            </p>
          </div>
        )}

      {/* Order found */}
      {result &&
        result !== 'not_found' &&
        !error && (
          <div className="bg-white rounded-2xl border border-navy-100 shadow-card p-5 lg:p-6 animate-slide-up">
            {/* Order header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-5 border-b border-navy-100">
              <div>
                <p className="text-xs text-navy-400 font-semibold uppercase tracking-wide">
                  Order Number
                </p>

                <p className="text-2xl font-extrabold text-navy-800">
                  {result.orderNumber}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${statusColors[result.status].dot} animate-pulse`}
                />

                <Badge
                  color={
                    result.status === 'Awaiting Payment'
                      ? 'amber'
                      : result.status === 'Proof Uploaded'
                        ? 'blue'
                        : result.status === 'Paid'
                          ? 'emerald'
                          : result.status === 'Confirmed'
                            ? 'teal'
                            : result.status === 'Production'
                              ? 'purple'
                              : result.status === 'Ready'
                                ? 'cyan'
                                : 'gray'
                  }
                >
                  {result.status}
                </Badge>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-5">
              {result.items.map((item, i) => (
                <div
                  key={`${item.productId}-${item.color}-${item.size}-${i}`}
                  className="flex items-center justify-between py-3 px-4 bg-navy-50 rounded-xl"
                >
                  <div>
                    <p className="font-semibold text-navy-800 text-sm">
                      {item.productTitle}
                    </p>

                    <p className="text-xs text-navy-400">
                      {item.color} · {item.size} · Qty{' '}
                      {item.quantity}
                    </p>
                  </div>

                  <span className="font-bold text-navy-700 text-sm">
                    {(
                      item.unitPrice * item.quantity
                    ).toLocaleString()}{' '}
                    ETB
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-3 border-t border-navy-100 mb-5">
              <span className="font-bold text-navy-700">
                Total
              </span>

              <span className="text-xl font-extrabold text-brand-cranberry">
                {result.total.toLocaleString()} ETB
              </span>
            </div>

            {/* Status timeline */}
            <div>
              <h3 className="text-sm font-bold text-navy-700 mb-4">
                Order Progress
              </h3>

              <div className="space-y-0">
                {statusOrder.map((status, i) => {
                  const Icon = statusIcons[status];

                  const currentIdx =
                    statusOrder.indexOf(result.status);

                  const done = i <= currentIdx;
                  const isLast =
                    i === statusOrder.length - 1;

                  return (
                    <div
                      key={status}
                      className="flex items-start gap-3"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                            done
                              ? 'bg-brand-cranberry text-white'
                              : 'bg-navy-100 text-navy-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        {!isLast && (
                          <div
                            className={`w-0.5 h-8 ${
                              i < currentIdx
                                ? 'bg-brand-cranberry'
                                : 'bg-navy-100'
                            }`}
                          />
                        )}
                      </div>

                      <div className="pt-1.5 pb-2">
                        <p
                          className={`text-sm font-semibold ${
                            done
                              ? 'text-navy-800'
                              : 'text-navy-300'
                          }`}
                        >
                          {status}
                        </p>

                        {i === currentIdx && (
                          <p className="text-xs text-brand-cranberry font-medium mt-0.5">
                            Current status
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rejection message */}
            {result.rejectionReason && (
              <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-100">
                <p className="text-sm font-bold text-red-700">
                  Payment Note
                </p>

                <p className="text-sm text-red-600 mt-1">
                  {result.rejectionReason}
                </p>
              </div>
            )}
          </div>
        )}
    </div>
  );
}