import { supabase } from '../config/supabase.ts';
import { NotFoundError } from '../utils/errors.ts';
import type { Product, ProductCategory, ProductVariant } from '../types/index.ts';
interface ProductRow {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  target: number;
  current_orders: number;
  active: boolean;
}

interface VariantRow {
  id: string;
  product_id: string;
  color: string;
  hex: string;
  sizes: string[];
  active: boolean;
}

function mapVariant(row: VariantRow): ProductVariant {
  return {
    id: row.id,
    productId: row.product_id,
    color: row.color,
    hex: row.hex,
    sizes: row.sizes ?? [],
    active: row.active,
  };
}

function mapProduct(row: ProductRow, variants: VariantRow[]): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    image: row.image,
    target: row.target,
    currentOrders: row.current_orders,
    active: row.active,
    variants: variants.map(mapVariant),
  };
}

export async function listProducts(includeInactive = false): Promise<Product[]> {
  let query = supabase.from('products').select('*').order('created_at', { ascending: true });
  if (!includeInactive) query = query.eq('active', true);

  const { data: products, error } = await query;
  if (error) throw error;
  if (!products || products.length === 0) return [];

  const ids = products.map((p) => p.id);
  const { data: variants, error: vErr } = await supabase
    .from('product_variants')
    .select('*')
    .in('product_id', ids);

  if (vErr) throw vErr;

  const byProduct = new Map<string, VariantRow[]>();
  for (const v of (variants ?? []) as VariantRow[]) {
    if (!byProduct.has(v.product_id)) byProduct.set(v.product_id, []);
    byProduct.get(v.product_id)!.push(v);
  }

  return (products as ProductRow[]).map((p) => mapProduct(p, byProduct.get(p.id) ?? []));
}

export async function getProductById(id: string): Promise<Product> {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!product) throw new NotFoundError('Product not found');

  const { data: variants, error: vErr } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', id);

  if (vErr) throw vErr;

  return mapProduct(product as ProductRow, (variants ?? []) as VariantRow[]);
}

export interface ProductInput {
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  target: number;
  active: boolean;
  variants: Omit<ProductVariant, 'id' | 'productId'>[];
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      title: input.title,
      description: input.description,
      price: input.price,
      category: input.category,
      image: input.image,
      target: input.target,
      active: input.active,
    })
    .select('*')
    .single();

  if (error) throw error;

  if (input.variants.length > 0) {
    const { error: vErr } = await supabase.from('product_variants').insert(
      input.variants.map((v) => ({
        product_id: product.id,
        color: v.color,
        hex: v.hex,
        sizes: v.sizes,
        active: v.active,
      }))
    );
    if (vErr) throw vErr;
  }

  return getProductById(product.id);
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  // Ensure product exists
  await getProductById(id);

  const update: Record<string, unknown> = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.description !== undefined) update.description = input.description;
  if (input.price !== undefined) update.price = input.price;
  if (input.category !== undefined) update.category = input.category;
  if (input.image !== undefined) update.image = input.image;
  if (input.target !== undefined) update.target = input.target;
  if (input.active !== undefined) update.active = input.active;

  if (Object.keys(update).length > 0) {
    const { error } = await supabase.from('products').update(update).eq('id', id);
    if (error) throw error;
  }

  // Replace variants if provided
  if (input.variants) {
    const { error: delErr } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', id);
    if (delErr) throw delErr;

    if (input.variants.length > 0) {
      const { error: insErr } = await supabase.from('product_variants').insert(
        input.variants.map((v) => ({
          product_id: id,
          color: v.color,
          hex: v.hex,
          sizes: v.sizes,
          active: v.active,
        }))
      );
      if (insErr) throw insErr;
    }
  }

  return getProductById(id);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleProductActive(id: string, active: boolean): Promise<Product> {
  const { error } = await supabase.from('products').update({ active }).eq('id', id);
  if (error) throw error;
  return getProductById(id);
}