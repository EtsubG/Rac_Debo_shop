import { useMemo } from 'react';
import { Factory, Printer, Download, FileSpreadsheet } from 'lucide-react';
import type { Order, Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface ProductionReportProps {
  orders: Order[];
  products: Product[];
}

interface ProductionRow {
  product: string;
  color: string;
  size: string;
  quantity: number;
  category: string;
}

export function ProductionReport({ orders, products }: ProductionReportProps) {
  const toast = useToast();

  const rows = useMemo<ProductionRow[]>(() => {
    const map = new Map<string, ProductionRow>();
    const activeOrders = orders.filter((o) =>
      ['Confirmed', 'Production', 'Ready', 'Delivered'].includes(o.status)
    );

    activeOrders.forEach((order) => {
      order.items.forEach((item) => {
        const key = `${item.productTitle}-${item.color}-${item.size}`;
        const existing = map.get(key);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          const product = products.find((p) => p.id === item.productId);
          map.set(key, {
            product: item.productTitle,
            color: item.color,
            size: item.size,
            quantity: item.quantity,
            category: product?.category || '',
          });
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.product !== b.product) return a.product.localeCompare(b.product);
      if (a.color !== b.color) return a.color.localeCompare(b.color);
      return a.size.localeCompare(b.size);
    });
  }, [orders, products]);

  const totalUnits = rows.reduce((sum, r) => sum + r.quantity, 0);
  const byProduct = rows.reduce((acc, r) => {
    acc[r.product] = (acc[r.product] || 0) + r.quantity;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Factory className="w-5 h-5 text-brand-cranberry" />
          <h2 className="text-base font-bold text-navy-800">Production / Manufacturer Report</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Printer className="w-4 h-4" />} onClick={() => toast.show('Report sent to printer', 'info')}>
            Print
          </Button>
          <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={() => toast.show('Report exported as CSV', 'success')}>
            Export
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-navy-100 p-4 shadow-soft">
          <p className="text-xs text-navy-400 font-semibold mb-1">Total Units</p>
          <p className="text-2xl font-extrabold text-navy-800">{totalUnits}</p>
        </div>
        <div className="bg-white rounded-2xl border border-navy-100 p-4 shadow-soft">
          <p className="text-xs text-navy-400 font-semibold mb-1">Products</p>
          <p className="text-2xl font-extrabold text-navy-800">{Object.keys(byProduct).length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-navy-100 p-4 shadow-soft">
          <p className="text-xs text-navy-400 font-semibold mb-1">Variants</p>
          <p className="text-2xl font-extrabold text-navy-800">{rows.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-navy-100 p-4 shadow-soft">
          <p className="text-xs text-navy-400 font-semibold mb-1">Orders in Production</p>
          <p className="text-2xl font-extrabold text-navy-800">
            {orders.filter((o) => ['Confirmed', 'Production'].includes(o.status)).length}
          </p>
        </div>
      </div>

      {/* Product summary */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-soft p-5">
        <h3 className="text-sm font-bold text-navy-700 mb-4">Summary by Product</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(byProduct).map(([product, qty]) => (
            <div key={product} className="bg-navy-50 rounded-xl p-3">
              <p className="text-xs text-navy-400 font-semibold truncate">{product}</p>
              <p className="text-xl font-extrabold text-navy-800">{qty} <span className="text-sm font-medium text-navy-400">units</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed table */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-100 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-navy-400" />
          <h3 className="text-sm font-bold text-navy-700">Detailed Breakdown</h3>
        </div>
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full">
            <thead>
              <tr className="bg-navy-50/50 border-b border-navy-100">
                <th className="text-left px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">Color/Variant</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">Size</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-navy-500 uppercase tracking-wide">Total Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-navy-50/30 transition">
                  <td className="px-5 py-3.5 font-semibold text-navy-800 text-sm">{row.product}</td>
                  <td className="px-5 py-3.5 text-sm text-navy-500">{row.category}</td>
                  <td className="px-5 py-3.5 text-sm text-navy-600">{row.color}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-navy-50 text-navy-700 text-xs font-bold">{row.size}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="font-extrabold text-brand-cranberry text-base">{row.quantity}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-navy-50 border-t-2 border-navy-100">
                <td colSpan={4} className="px-5 py-4 font-bold text-navy-700 text-sm text-right">Total Units to Produce:</td>
                <td className="px-5 py-4 text-right">
                  <span className="text-xl font-extrabold text-navy-800">{totalUnits}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="py-12 text-center">
            <Factory className="w-10 h-10 text-navy-200 mx-auto mb-3" />
            <p className="text-navy-400 font-medium">No confirmed orders in production yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
