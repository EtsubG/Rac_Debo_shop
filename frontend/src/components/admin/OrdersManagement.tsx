import { useEffect, useMemo, useState } from 'react';

import {
  Eye,
  FileImage,
  User,
  Phone,
  MessageSquare,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Factory,
  PackageCheck,
  Truck,
  ShieldCheck,
} from 'lucide-react';

import type { Order, OrderStatus } from '@/types';

import {
  Badge,
  Button,
  Textarea,
} from '@/components/ui/Button';

import { Drawer, Modal } from '@/components/ui/Modal';

import { useToast } from '@/components/ui/Toast';

import {
  getAdminOrders,
  approveOrder,
  rejectOrder,
  updateOrderStatus,
} from '@/api';

const statusFilters: (OrderStatus | 'All')[] = [
  'All',
  'Awaiting Payment',
  'Proof Uploaded',
  'Paid',
  'Confirmed',
  'Production',
  'Ready',
  'Delivered',
];

const statusColor = (status: OrderStatus) => {
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

interface OrdersManagementProps {
  orders?: Order[];
}

export function OrdersManagement(
  _props: OrdersManagementProps
) {
  const toast = useToast();

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [filter, setFilter] =
    useState<OrderStatus | 'All'>('All');

  const [search, setSearch] =
    useState('');

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [rejectMode, setRejectMode] =
    useState(false);

  const [rejectReason, setRejectReason] =
    useState('');

  const [processing, setProcessing] =
    useState(false);

  const [confirmStatus, setConfirmStatus] =
    useState<OrderStatus | null>(null);

  const [page, setPage] =
    useState(1);

  const perPage = 8;

  const loadOrders = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response =
        await getAdminOrders({
          limit: 1000,
          offset: 0,
        });

      setOrders(
        response.orders || []
      );
    } catch (error) {
      toast.show(
        error instanceof Error
          ? error.message
          : 'Failed to load orders',
        'error'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return orders.filter((order) => {
      const statusMatch =
        filter === 'All' ||
        order.status === filter;

      const searchMatch =
        !searchValue ||
        order.orderNumber
          .toLowerCase()
          .includes(searchValue) ||
        order.customerName
          .toLowerCase()
          .includes(searchValue) ||
        order.phone
          .toLowerCase()
          .includes(searchValue);

      return (
        statusMatch &&
        searchMatch
      );
    });
  }, [orders, filter, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length / perPage
    )
  );

  const paginated =
    filtered.slice(
      (page - 1) * perPage,
      page * perPage
    );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const closeDrawer = () => {
    setSelectedOrder(null);
    setRejectMode(false);
    setRejectReason('');
  };

  const replaceOrder = (
    updatedOrder: Order
  ) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === updatedOrder.id
          ? updatedOrder
          : order
      )
    );

    setSelectedOrder(updatedOrder);
  };

  const handleApprove = async () => {
    if (!selectedOrder) return;

    try {
      setProcessing(true);

      const response =
        await approveOrder(
          selectedOrder.id
        );

      replaceOrder(
        response.order
      );

      toast.show(
        'Payment approved — order moved to Paid',
        'success'
      );
    } catch (error) {
      toast.show(
        error instanceof Error
          ? error.message
          : 'Failed to approve payment',
        'error'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;

    if (!rejectReason.trim()) {
      toast.show(
        'Please provide a rejection reason',
        'warning'
      );
      return;
    }

    try {
      setProcessing(true);

      const response =
        await rejectOrder(
          selectedOrder.id,
          rejectReason.trim()
        );

      replaceOrder(
        response.order
      );

      toast.show(
        'Payment rejected and reason saved',
        'success'
      );

      setRejectMode(false);
      setRejectReason('');
    } catch (error) {
      toast.show(
        error instanceof Error
          ? error.message
          : 'Failed to reject payment',
        'error'
      );
    } finally {
      setProcessing(false);
    }
  };

  /*
   * Get the next action available
   * for the current order.
   */
  const getNextAction = (
    status: OrderStatus
  ): {
    status: OrderStatus;
    label: string;
    icon: React.ReactNode;
  } | null => {
    switch (status) {
      case 'Paid':
        return {
          status: 'Confirmed',
          label: 'Confirm Order',
          icon: (
            <ShieldCheck className="w-5 h-5" />
          ),
        };

      case 'Confirmed':
        return {
          status: 'Production',
          label: 'Start Production',
          icon: (
            <Factory className="w-5 h-5" />
          ),
        };

      case 'Production':
        return {
          status: 'Ready',
          label: 'Mark Ready',
          icon: (
            <PackageCheck className="w-5 h-5" />
          ),
        };

      case 'Ready':
        return {
          status: 'Delivered',
          label: 'Mark Delivered',
          icon: (
            <Truck className="w-5 h-5" />
          ),
        };

      default:
        return null;
    }
  };

  const handleNextStatus = async (status: OrderStatus) => {
    if (!selectedOrder) return;

    try {
      setProcessing(true);

      const response =
        await updateOrderStatus(
          selectedOrder.id,
          status
        );

      replaceOrder(
        response.order
      );

      toast.show(
        `Order moved to ${status}`,
        'success'
      );
    } catch (error) {
      toast.show(
        error instanceof Error
          ? error.message
          : 'Failed to update order status',
        'error'
      );
    } finally {
      setProcessing(false);
      setConfirmStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-navy-200 border-t-brand-cranberry rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm font-semibold text-navy-500">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-bold text-navy-800">
            Orders
          </h2>

          <p className="text-xs text-navy-400 mt-1">
            Manage orders, verify payments,
            and move orders through production.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            loadOrders(true)
          }
          disabled={refreshing}
          icon={
            <RefreshCw
              className={`w-4 h-4 ${
                refreshing
                  ? 'animate-spin'
                  : ''
              }`}
            />
          }
        >
          {refreshing
            ? 'Refreshing...'
            : 'Refresh'}
        </Button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3">

        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by order #, name, or phone..."
          className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:border-brand-cranberry outline-none text-navy-800 placeholder:text-navy-300 text-sm transition"
        />

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {statusFilters.map(
            (status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setPage(1);
                }}
                className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all ${
                  filter === status
                    ? 'bg-navy-800 text-white shadow-soft'
                    : 'bg-white border-2 border-navy-200 text-navy-500 hover:border-navy-300'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-navy-50/50 border-b border-navy-100">

              <th className="text-left px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">
                Order #
              </th>

              <th className="text-left px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">
                Customer
              </th>

              <th className="text-left px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">
                Items
              </th>

              <th className="text-right px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">
                Total
              </th>

              <th className="text-center px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">
                Status
              </th>

              <th className="text-center px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">
                Proof
              </th>

              <th className="text-right px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-navy-50">
            {paginated.map(
              (order) => (
                <tr
                  key={order.id}
                  className="hover:bg-navy-50/30 transition"
                >
                  <td className="px-5 py-4">
                    <span className="font-bold text-navy-800 text-sm">
                      {order.orderNumber}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold text-navy-700 text-sm">
                      {order.customerName}
                    </p>

                    <p className="text-xs text-navy-400">
                      {order.phone}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-sm text-navy-600">
                      {order.items.length}{' '}
                      item(s)
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <span className="font-bold text-navy-800 text-sm">
                      {order.total.toLocaleString()}{' '}
                      ETB
                    </span>
                  </td>

                  <td className="px-5 py-4 text-center">
                    <Badge
                      color={statusColor(
                        order.status
                      )}
                    >
                      {order.status}
                    </Badge>
                  </td>

                  <td className="px-5 py-4 text-center">
                    {order.proofUrl ? (
                      <button
                        onClick={() =>
                          setSelectedOrder(
                            order
                          )
                        }
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition"
                        title="View payment proof"
                      >
                        <FileImage className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-xs text-navy-300">
                        —
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelectedOrder(
                          order
                        )
                      }
                      icon={
                        <Eye className="w-4 h-4" />
                      }
                    >
                      View
                    </Button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="lg:hidden space-y-3">
        {paginated.map(
          (order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-navy-100 shadow-soft p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-navy-800 text-sm">
                    {order.orderNumber}
                  </p>

                  <p className="text-xs text-navy-400 mt-1">
                    {order.customerName}
                  </p>
                </div>

                <Badge
                  color={statusColor(
                    order.status
                  )}
                >
                  {order.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="text-xs text-navy-400">
                    Total
                  </p>

                  <p className="font-bold text-navy-800">
                    {order.total.toLocaleString()}{' '}
                    ETB
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedOrder(
                      order
                    )
                  }
                  icon={
                    <Eye className="w-4 h-4" />
                  }
                >
                  View
                </Button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Empty */}
      {paginated.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-navy-100">
          <Filter className="w-10 h-10 text-navy-200 mx-auto mb-3" />

          <p className="text-navy-500 font-semibold">
            No orders match your filters.
          </p>

          <p className="text-xs text-navy-400 mt-1">
            Try changing the status filter
            or search term.
          </p>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-center gap-2 pt-2">

          <button
            onClick={() =>
              setPage((current) =>
                Math.max(
                  1,
                  current - 1
                )
              )
            }
            disabled={page === 1}
            className="w-9 h-9 rounded-lg border border-navy-200 flex items-center justify-center text-navy-500 disabled:opacity-40 hover:bg-navy-50 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) =>
              index + 1
          ).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                onClick={() =>
                  setPage(pageNumber)
                }
                className={`w-9 h-9 rounded-lg font-bold text-sm transition ${
                  page === pageNumber
                    ? 'bg-navy-800 text-white'
                    : 'border border-navy-200 text-navy-500 hover:bg-navy-50'
                }`}
              >
                {pageNumber}
              </button>
            )
          )}

          <button
            onClick={() =>
              setPage((current) =>
                Math.min(
                  totalPages,
                  current + 1
                )
              )
            }
            disabled={
              page === totalPages
            }
            className="w-9 h-9 rounded-lg border border-navy-200 flex items-center justify-center text-navy-500 disabled:opacity-40 hover:bg-navy-50 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Order drawer */}
      {selectedOrder && (
        <Drawer
          open={true}
          onClose={closeDrawer}
          title="Order Details"
        >
          <div className="p-5 lg:p-6 space-y-5">

            {!rejectMode ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-navy-400 font-semibold uppercase">
                      Order Number
                    </p>

                    <p className="text-xl font-extrabold text-navy-800">
                      {selectedOrder.orderNumber}
                    </p>
                  </div>

                  <Badge
                    color={statusColor(
                      selectedOrder.status
                    )}
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>

                {/* Progress */}
                <div className="bg-navy-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-navy-500 uppercase mb-3">
                    Order Progress
                  </p>

                  <div className="space-y-2">
                    {[
                      'Awaiting Payment',
                      'Paid',
                      'Confirmed',
                      'Production',
                      'Ready',
                      'Delivered',
                    ].map(
                      (status) => {
                        const statusIndex =
                          [
                            'Awaiting Payment',
                            'Paid',
                            'Confirmed',
                            'Production',
                            'Ready',
                            'Delivered',
                          ].indexOf(
                            selectedOrder.status
                          );

                        const itemIndex =
                          [
                            'Awaiting Payment',
                            'Paid',
                            'Confirmed',
                            'Production',
                            'Ready',
                            'Delivered',
                          ].indexOf(
                            status
                          );

                        const completed =
                          itemIndex <=
                          statusIndex;

                        return (
                          <div
                            key={status}
                            className="flex items-center gap-2"
                          >
                            <div
                              className={`w-3 h-3 rounded-full ${
                                completed
                                  ? 'bg-emerald-500'
                                  : 'bg-navy-200'
                              }`}
                            />

                            <span
                              className={`text-xs ${
                                completed
                                  ? 'font-bold text-navy-700'
                                  : 'text-navy-400'
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Customer */}
                <div className="bg-navy-50 rounded-xl p-4 space-y-2.5">
                  <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wide">
                    Customer Details
                  </h3>

                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-navy-400" />

                    <span className="text-navy-700 font-medium">
                      {selectedOrder.customerName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-navy-400" />

                    <span className="text-navy-700">
                      {selectedOrder.phone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-navy-400" />

                    <span className="text-navy-700">
                      {selectedOrder.telegram}
                    </span>
                  </div>

                  {selectedOrder.notes && (
                    <p className="text-sm text-navy-500 italic pt-1 border-t border-navy-200">
                      "{selectedOrder.notes}"
                    </p>
                  )}
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wide mb-2">
                    Order Breakdown
                  </h3>

                  <div className="space-y-2">
                    {selectedOrder.items.map(
                      (item, index) => (
                        <div
                          key={
                            item.id ||
                            index
                          }
                          className="flex items-center justify-between py-2.5 px-4 bg-white border border-navy-100 rounded-xl"
                        >
                          <div>
                            <p className="font-semibold text-navy-800 text-sm">
                              {item.productTitle}
                            </p>

                            <p className="text-xs text-navy-400">
                              {item.color} ·{' '}
                              {item.size} ·
                              Qty{' '}
                              {item.quantity}
                            </p>
                          </div>

                          <span className="font-bold text-navy-700 text-sm">
                            {(
                              item.unitPrice *
                              item.quantity
                            ).toLocaleString()}{' '}
                            ETB
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-3 px-4">
                    <span className="font-bold text-navy-700">
                      Total Amount
                    </span>

                    <span className="text-xl font-extrabold text-brand-cranberry">
                      {selectedOrder.total.toLocaleString()}{' '}
                      ETB
                    </span>
                  </div>
                </div>

                {/* Payment proof */}
                <div>
                  <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wide mb-2">
                    Payment Proof
                  </h3>

                  {selectedOrder.proofUrl ? (
                    <div className="rounded-xl overflow-hidden border-2 border-navy-100">
                      <img
                        src={
                          selectedOrder.proofUrl
                        }
                        alt="Payment proof"
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 bg-navy-50 rounded-xl">
                      <FileImage className="w-10 h-10 text-navy-200 mb-2" />

                      <p className="text-sm text-navy-400 font-medium">
                        No payment proof uploaded
                      </p>
                    </div>
                  )}
                </div>

                {/* Rejection reason */}
                {selectedOrder.rejectionReason && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-red-600 uppercase mb-1">
                      Rejection Reason
                    </p>

                    <p className="text-sm text-red-700">
                      {
                        selectedOrder.rejectionReason
                      }
                    </p>
                  </div>
                )}

                {/* Payment actions */}
                {(selectedOrder.status ===
                  'Proof Uploaded' ||
                  selectedOrder.status ===
                    'Awaiting Payment') && (
                  <div className="space-y-2 pt-2">

                    <Button
                      variant="success"
                      fullWidth
                      onClick={
                        handleApprove
                      }
                      disabled={
                        processing
                      }
                      icon={
                        <CheckCircle2 className="w-5 h-5" />
                      }
                    >
                      {processing
                        ? 'Processing...'
                        : selectedOrder.status ===
                          'Proof Uploaded'
                        ? 'Approve Payment'
                        : 'Mark as Paid'}
                    </Button>

                    <Button
                      variant="danger"
                      fullWidth
                      onClick={() =>
                        setRejectMode(
                          true
                        )
                      }
                      disabled={
                        processing
                      }
                      icon={
                        <XCircle className="w-5 h-5" />
                      }
                    >
                      Reject Payment
                    </Button>
                  </div>
                )}

                {/* Next workflow action */}
                {getNextAction(
                  selectedOrder.status
                ) && (
                  <div className="border-t border-navy-100 pt-4">
                    <p className="text-xs font-bold text-navy-500 uppercase mb-2">
                      Next Step
                    </p>

                    <Button
                      variant="success"
                      fullWidth
                      onClick={() =>
                        setConfirmStatus(
                          getNextAction(
                            selectedOrder.status
                          )?.status ?? null
                        )
                      }
                      disabled={
                        processing
                      }
                      icon={
                        getNextAction(
                          selectedOrder.status
                        )?.icon
                      }
                    >
                      {processing
                        ? 'Updating...'
                        : getNextAction(
                            selectedOrder.status
                          )?.label}
                    </Button>
                  </div>
                )}

                {confirmStatus &&
                  getNextAction(
                    selectedOrder.status
                  ) && (
                    <Modal
                      open={true}
                      onClose={() =>
                        setConfirmStatus(null)
                      }
                      title="Confirm order status"
                      size="sm"
                    >
                      <div className="p-6">
                        <p className="text-sm text-navy-600">
                          Move order{' '}
                          <span className="font-bold text-navy-800">
                            {selectedOrder.orderNumber}
                          </span>{' '}
                          to{' '}
                          <span className="font-bold text-navy-800">
                            {confirmStatus}
                          </span>
                          ?
                        </p>

                        <div className="flex gap-2 mt-6">
                          <Button
                            variant="outline"
                            fullWidth
                            onClick={() =>
                              setConfirmStatus(null)
                            }
                            disabled={processing}
                          >
                            Cancel
                          </Button>

                          <Button
                            variant="success"
                            fullWidth
                            onClick={() =>
                              handleNextStatus(
                                confirmStatus
                              )
                            }
                            disabled={processing}
                          >
                            {processing
                              ? 'Updating...'
                              : 'Confirm'}
                          </Button>
                        </div>
                      </div>
                    </Modal>
                  )}

                {/* Delivered */}
                {selectedOrder.status ===
                  'Delivered' && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />

                    <p className="font-bold text-emerald-700">
                      Order Completed
                    </p>

                    <p className="text-xs text-emerald-600 mt-1">
                      This order has been delivered.
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* Reject screen */
              <div className="space-y-4">

                <div className="flex items-center gap-3 bg-red-50 rounded-xl p-4">
                  <XCircle className="w-6 h-6 text-red-500" />

                  <div>
                    <p className="font-bold text-red-700 text-sm">
                      Reject Payment
                    </p>

                    <p className="text-xs text-red-400">
                      Order{' '}
                      {
                        selectedOrder.orderNumber
                      }
                    </p>
                  </div>
                </div>

                <Textarea
                  label="Rejection Reason"
                  placeholder="Explain why the payment is being rejected..."
                  rows={5}
                  value={
                    rejectReason
                  }
                  onChange={(e) =>
                    setRejectReason(
                      e.target.value
                    )
                  }
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      setRejectMode(
                        false
                      );
                      setRejectReason(
                        ''
                      );
                    }}
                    disabled={
                      processing
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="danger"
                    fullWidth
                    onClick={
                      handleReject
                    }
                    disabled={
                      processing
                    }
                    icon={
                      <XCircle className="w-4 h-4" />
                    }
                  >
                    {processing
                      ? 'Rejecting...'
                      : 'Confirm Rejection'}
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