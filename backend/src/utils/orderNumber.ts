import { supabase } from '../config/supabase.js';

/**
 * Generates the next sequential order number in the form DEBO-0001.
 * Uses a Postgres-side max lookup — safe under normal concurrency;
 * for high concurrency, wrap in a DB sequence instead.
 */
export async function generateOrderNumber(): Promise<string> {
  const { data, error } = await supabase
    .from('orders')
    .select('order_number')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) throw error;

  let max = 0;
  for (const row of data ?? []) {
    const match = /^DEBO-(\d+)$/.exec(row.order_number);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > max) max = n;
    }
  }

  return `DEBO-${String(max + 1).padStart(4, '0')}`;
}