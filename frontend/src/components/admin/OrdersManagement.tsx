import { useState, useMemo } from 'react';
import {
  Eye,
  CheckCircle2,
  XCircle,
  Pencil,
  FileImage,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageSquare,
  User,
  X,
} from 'lucide-react';
import type { Order, OrderStatus } from '@/types';
import { Badge, Button, Input, Textarea } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { statusColors, statusOrder } from '@/data/mockData';

interface OrdersManagementProps {
  orders: Order[];
}

const statusFilters: (OrderStatus | 'All')[] = ['All', ...statusOrder];

export function OrdersManagement({ orders }: OrdersManagementProps) {
  const toast = useToast();
  const [filter, setFilter] = useState<OrderStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const statusMatch = filter === 'All' || o.status === filter;
      const searchMatch =
        !search ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.phone.includes(search);
      return statusMatch && searchMatch;
    });
  }, [orders, filter, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleApprove = () => {
    toast.show('Payment approved — order moved to Paid', 'success');
    setSelectedOrder(null);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.show('Please provide a rejection reason', 'warning');
      return;
    }
    toast.show('Payment rejected with reason', 'error');
    setRejectMode(false);
    setRejectReason('');
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, name, or phone..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-navy-200 focus:border-brand-cranberry outline-none text-navy-800 placeholder:text-navy-300 text-sm transition"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1); }}
              className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all ${
                filter === s
                  ? 'bg-navy-800 text-white shadow-soft'
                  : 'bg-white border-2 border-navy-200 text-navy-500 hover:border-navy-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-navy-50/50 border-b border-navy-100">
              <th className="text-left px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">Order #</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">Customer</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">Items</th>
              <th className="text-right px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">Total</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">Status</th>
              <th className="text-center px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">Proof</th>
              <th className="text-right px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {paginated.map((order) => (
              <tr key={order.id} className="hover:bg-navy-50/30 transition">
                <td className="px-5 py-4">
                  <span className="font-bold text-navy-800 text-sm">{order.orderNumber}</span>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-navy-700 text-sm">{order.customerName}</p>
                  <p className="text-xs text-navy-400">{order.phone}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-navy-600">{order.items.length} item(s)</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="font-bold text-navy-800 text-sm">{order.total.toLocaleString()} ETB</span>
                </td>
                <td className="px-5 py-4 text-center">
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
                </td>
                <td className="px-5 py-4 text-center">
                  {order.proofUrl ? (
                    <button onClick={() => setSelectedOrder(order)} className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition">
                      <FileImage className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-xs text-navy-300">—</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setSelectedOrder(order)} className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-navy-400 hover:bg-navy-100 hover:text-navy-700 transition" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                    {(order.status === 'Proof Uploaded' || order.status === 'Awaiting Payment') && (
                      <>
                        <button onClick={() => { setSelectedOrder(order); setRejectMode(false); }} className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-emerald-500 hover:bg-emerald-50 transition" title="Approve">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSelectedOrder(order); setRejectMode(true); }} className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-red-400 hover:bg-red-50 transition" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button onClick={() => setSelectedOrder(order)} className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-navy-400 hover:bg-navy-100 hover:text-navy-700 transition" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginated.length === 0 && (
          <div className="py-16 text-center">
            <Filter className="w-10 h-10 text-navy-200 mx-auto mb-3" />
            <p className="text-navy-400 font-medium">No orders match your filters.</p>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {paginated.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border border-navy-100 shadow-soft p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-navy-800 text-sm">{order.orderNumber}</p>
                <p className="text-xs text-navy-400">{order.customerName} · {order.phone}</p>
              </div>
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
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-navy-500">{order.items.length} item(s)</span>
              <span className="font-bold text-navy-800">{order.total.toLocaleString()} ETB</span>
            </div>
            <div className="flex gap-2 pt-3 border-t border-navy-50">
              <Button variant="outline" size="sm" fullWidth onClick={() => setSelectedOrder(order)} icon={<Eye className="w-4 h-4" />}>
                View
              </Button>
              {order.proofUrl && (
                <Button variant="outline" size="sm" fullWidth onClick={() => setSelectedOrder(order)} icon={<FileImage className="w-4 h-4" />}>
                  Proof
                </Button>
              )}
            </div>
          </div>
        ))}
        {paginated.length === 0 && (
          <div className="py-16 text-center bg-white rounded-2xl border border-navy-100">
            <Filter className="w-10 h-10 text-navy-200 mx-auto mb-3" />
            <p className="text-navy-400 font-medium">No orders match your filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded-lg border border-navy-200 flex items-center justify-center text-navy-500 disabled:opacity-40 hover:bg-navy-50 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg font-bold text-sm transition ${
                page === i + 1 ? 'bg-navy-800 text-white' : 'border border-navy-200 text-navy-500 hover:bg-navy-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 rounded-lg border border-navy-200 flex items-center justify-center text-navy-500 disabled:opacity-40 hover:bg-navy-50 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Payment Verification Drawer */}
      {selectedOrder && (
        <Drawer
          open={true}
          onClose={() => { setSelectedOrder(null); setRejectMode(false); setRejectReason(''); }}
          title="Payment Verification"
        >
          <div className="p-5 lg:p-6 space-y-5">
            {!rejectMode ? (
              <>
                {/* Order number + status */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-navy-400 font-semibold uppercase">Order Number</p>
                    <p className="text-xl font-extrabold text-navy-800">{selectedOrder.orderNumber}</p>
                  </div>
                  <Badge color={
                    selectedOrder.status === 'Awaiting Payment' ? 'amber' :
                    selectedOrder.status === 'Proof Uploaded' ? 'blue' :
                    selectedOrder.status === 'Paid' ? 'emerald' :
                    selectedOrder.status === 'Confirmed' ? 'teal' :
                    selectedOrder.status === 'Production' ? 'purple' :
                    selectedOrder.status === 'Ready' ? 'cyan' : 'gray'
                  }>
                    {selectedOrder.status}
                  </Badge>
                </div>

                {/* Customer details */}
                <div className="bg-navy-50 rounded-xl p-4 space-y-2.5">
                  <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wide mb-1">Customer Details</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-navy-400" />
                    <span className="text-navy-700 font-medium">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-navy-400" />
                    <span className="text-navy-700">{selectedOrder.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-navy-400" />
                    <span className="text-navy-700">{selectedOrder.telegram}</span>
                  </div>
                  {selectedOrder.notes && (
                    <p className="text-sm text-navy-500 italic pt-1 border-t border-navy-200">"{selectedOrder.notes}"</p>
                  )}
                </div>

                {/* Order breakdown */}
                <div>
                  <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wide mb-2">Order Breakdown</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 px-4 bg-white border border-navy-100 rounded-xl">
                        <div>
                          <p className="font-semibold text-navy-800 text-sm">{item.productTitle}</p>
                          <p className="text-xs text-navy-400">{item.color} · {item.size} · Qty {item.quantity}</p>
                        </div>
                        <span className="font-bold text-navy-700 text-sm">{(item.unitPrice * item.quantity).toLocaleString()} ETB</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-3 px-4">
                    <span className="font-bold text-navy-700">Total Amount</span>
                    <span className="text-xl font-extrabold text-brand-cranberry">{selectedOrder.total.toLocaleString()} ETB</span>
                  </div>
                </div>

                {/* Payment proof */}
                {selectedOrder.proofUrl ? (
                  <div>
                    <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wide mb-2">Payment Proof</h3>
                    <div className="rounded-xl overflow-hidden border-2 border-navy-100">
                      <img src={selectedOrder.proofUrl} alt="Payment proof" className="w-full" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 bg-navy-50 rounded-xl">
                    <FileImage className="w-10 h-10 text-navy-200 mb-2" />
                    <p className="text-sm text-navy-400 font-medium">No payment proof uploaded</p>
                  </div>
                )}

                {/* Actions */}
                {(selectedOrder.status === 'Proof Uploaded' || selectedOrder.status === 'Awaiting Payment') && (
                  <div className="flex gap-2 pt-2">
                    <Button variant="success" fullWidth onClick={handleApprove} icon={<CheckCircle2 className="w-5 h-5" />}>
                      Approve Payment
                    </Button>
                    <Button variant="danger" fullWidth onClick={() => setRejectMode(true)} icon={<XCircle className="w-5 h-5" />}>
                      Reject Payment
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-3 bg-red-50 rounded-xl p-4">
                  <XCircle className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="font-bold text-red-700 text-sm">Reject Payment for {selectedOrder.orderNumber}</p>
                    <p className="text-xs text-red-400">The customer will be notified with your reason.</p>
                  </div>
                </div>
                <Textarea
                  label="Rejection Reason"
                  placeholder="Explain why the payment is being rejected..."
                  rows={5}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  error={!rejectReason.trim() ? undefined : undefined}
                />
                <div className="flex gap-2">
                  <Button variant="outline" fullWidth onClick={() => setRejectMode(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" fullWidth onClick={handleReject} disabled={!rejectReason.trim()}>
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Drawer>
      )}
    </div>
  );
}
