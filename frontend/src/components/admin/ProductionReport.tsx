import { useEffect, useState } from 'react';
import {
  Factory,
  Printer,
  Download,
  RefreshCw,
  Package,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { getProductionReport } from '@/api';

interface ProductionRow {
  product: string;
  color: string;
  size: string;
  quantity: number;
  category: string;
}

interface ProductionReportData {
  rows: ProductionRow[];
  totalUnits: number;
  byProduct: Record<string, number>;
  ordersInProduction: number;
}

export function ProductionReport() {
  const [report, setReport] = useState<ProductionReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadReport = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const data = await getProductionReport();
      setReport(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load production report'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const escapeCsv = (value: string | number) => {
    const text = String(value);

    if (
      text.includes(',') ||
      text.includes('"') ||
      text.includes('\n')
    ) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  };

  const handleExport = () => {
    if (!report || report.rows.length === 0) {
      return;
    }

    const header = [
      'Product',
      'Category',
      'Color',
      'Size',
      'Quantity',
    ];

    const rows = report.rows.map((row) => [
      escapeCsv(row.product),
      escapeCsv(row.category),
      escapeCsv(row.color),
      escapeCsv(row.size),
      escapeCsv(row.quantity),
    ]);

    const productSummary = Object.entries(report.byProduct).map(
      ([product, quantity]) => [
        escapeCsv(product),
        '',
        '',
        'TOTAL',
        escapeCsv(quantity),
      ]
    );

    const csv = [
      header.join(','),
      ...rows.map((row) => row.join(',')),
      '',
      'Product Summary',
      ...productSummary.map((row) => row.join(',')),
      '',
      `Total Units,${report.totalUnits}`,
      `Orders in Production,${report.ordersInProduction}`,
    ].join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `production-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-navy-200 border-t-brand-cranberry rounded-full animate-spin mx-auto mb-4" />

            <p className="text-sm font-semibold text-navy-500">
              Loading production report...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
          <Factory className="w-10 h-10 text-red-400 mx-auto mb-3" />

          <h2 className="text-lg font-bold text-navy-800 mb-2">
            Unable to load production report
          </h2>

          <p className="text-sm text-navy-500 mb-5">
            {error || 'Production report is unavailable.'}
          </p>

          <Button
            onClick={() => loadReport()}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const productSummary = Object.entries(report.byProduct);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-brand-cranberry" />

            <h2 className="text-base font-bold text-navy-800">
              Production / Manufacturer Report
            </h2>
          </div>

          <p className="text-xs text-navy-400 mt-1">
            Quantities calculated from paid and confirmed orders
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadReport(true)}
            disabled={refreshing}
            icon={
              <RefreshCw
                className={`w-4 h-4 ${
                  refreshing ? 'animate-spin' : ''
                }`}
              />
            }
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            Print
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={report.rows.length === 0}
            icon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-navy-100 p-4 shadow-soft">
          <p className="text-xs text-navy-400 font-semibold mb-1">
            Total Units
          </p>

          <p className="text-2xl font-extrabold text-navy-800">
            {report.totalUnits.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-navy-100 p-4 shadow-soft">
          <p className="text-xs text-navy-400 font-semibold mb-1">
            Products
          </p>

          <p className="text-2xl font-extrabold text-navy-800">
            {productSummary.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-navy-100 p-4 shadow-soft">
          <p className="text-xs text-navy-400 font-semibold mb-1">
            Variants
          </p>

          <p className="text-2xl font-extrabold text-navy-800">
            {report.rows.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-navy-100 p-4 shadow-soft">
          <p className="text-xs text-navy-400 font-semibold mb-1">
            Orders in Production
          </p>

          <p className="text-2xl font-extrabold text-navy-800">
            {report.ordersInProduction}
          </p>
        </div>
      </div>

      {/* Product totals */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
        <div className="px-5 lg:px-6 py-4 border-b border-navy-100">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-cranberry" />

            <h3 className="text-sm font-bold text-navy-800">
              Total Quantity by Product
            </h3>
          </div>

          <p className="text-xs text-navy-400 mt-1">
            Useful for telling the manufacturer exactly how many items
            are required.
          </p>
        </div>

        {productSummary.length === 0 ? (
          <div className="py-10 text-center">
            <Package className="w-8 h-8 text-navy-200 mx-auto mb-2" />

            <p className="text-sm font-semibold text-navy-500">
              No production quantities yet
            </p>
          </div>
        ) : (
          <div className="divide-y divide-navy-50">
            {productSummary.map(([product, quantity]) => (
              <div
                key={product}
                className="flex items-center justify-between px-5 lg:px-6 py-4"
              >
                <p className="text-sm font-bold text-navy-800">
                  {product}
                </p>

                <span className="text-sm font-extrabold text-brand-cranberry">
                  {quantity.toLocaleString()} units
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed production table */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
        <div className="px-5 lg:px-6 py-4 border-b border-navy-100">
          <h3 className="text-sm font-bold text-navy-800">
            Detailed Production Quantities
          </h3>

          <p className="text-xs text-navy-400 mt-1">
            Product, color, size and quantity required
          </p>
        </div>

        {report.rows.length === 0 ? (
          <div className="py-12 text-center">
            <Factory className="w-9 h-9 text-navy-200 mx-auto mb-3" />

            <p className="text-sm font-semibold text-navy-500">
              Nothing to produce yet
            </p>

            <p className="text-xs text-navy-400 mt-1">
              Production quantities will appear after payment is
              approved.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="bg-navy-50/60">
                  <th className="text-left px-5 py-3 text-xs font-bold text-navy-500">
                    Product
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-bold text-navy-500">
                    Category
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-bold text-navy-500">
                    Color
                  </th>

                  <th className="text-left px-5 py-3 text-xs font-bold text-navy-500">
                    Size
                  </th>

                  <th className="text-right px-5 py-3 text-xs font-bold text-navy-500">
                    Quantity
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-navy-50">
                {report.rows.map((row, index) => (
                  <tr
                    key={`${row.product}-${row.color}-${row.size}-${index}`}
                    className="hover:bg-navy-50/40 transition"
                  >
                    <td className="px-5 py-3.5 text-sm font-bold text-navy-800">
                      {row.product}
                    </td>

                    <td className="px-5 py-3.5 text-sm text-navy-500">
                      {row.category || '—'}
                    </td>

                    <td className="px-5 py-3.5 text-sm text-navy-600">
                      {row.color || '—'}
                    </td>

                    <td className="px-5 py-3.5 text-sm text-navy-600">
                      {row.size || '—'}
                    </td>

                    <td className="px-5 py-3.5 text-right text-sm font-extrabold text-navy-800">
                      {row.quantity.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="bg-navy-50/60">
                  <td
                    colSpan={4}
                    className="px-5 py-4 text-sm font-extrabold text-navy-800 text-right"
                  >
                    TOTAL UNITS
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-extrabold text-brand-cranberry">
                    {report.totalUnits.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}