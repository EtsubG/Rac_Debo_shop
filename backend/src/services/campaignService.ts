import { supabase } from '../config/supabase.ts';
import { NotFoundError, BadRequestError } from '../utils/errors.ts';
import type { Campaign } from '../types/index.ts';

interface CampaignRow {
  id: string;
  name: string;
  description: string;
  active: boolean;
  start_date: string;
  end_date: string;
}

interface OrderAggRow {
  campaign_id: string | null;
  total: number;
}

export async function listCampaigns(): Promise<Campaign[]> {
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const { data: orders, error: oErr } = await supabase
    .from('orders')
    .select('campaign_id, total');

  if (oErr) throw oErr;

  const stats = new Map<string, { count: number; sales: number }>();
  for (const o of (orders ?? []) as OrderAggRow[]) {
    if (!o.campaign_id) continue;
    const s = stats.get(o.campaign_id) ?? { count: 0, sales: 0 };
    s.count += 1;
    s.sales += Number(o.total);
    stats.set(o.campaign_id, s);
  }

  return (campaigns as CampaignRow[]).map((c) => {
    const s = stats.get(c.id) ?? { count: 0, sales: 0 };
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      active: c.active,
      startDate: c.start_date,
      endDate: c.end_date,
      orderCount: s.count,
      totalSales: s.sales,
    };
  });
}

export async function getActiveCampaign(): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('active', true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', data.id);

  const { data: sums } = await supabase
    .from('orders')
    .select('total')
    .eq('campaign_id', data.id);

  const totalSales = (sums ?? []).reduce((acc, r) => acc + Number(r.total), 0);

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    active: data.active,
    startDate: data.start_date,
    endDate: data.end_date,
    orderCount: count ?? 0,
    totalSales,
  };
}

export interface CampaignInput {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export async function createCampaign(input: CampaignInput): Promise<Campaign> {
  if (new Date(input.endDate) < new Date(input.startDate)) {
    throw new BadRequestError('End date must be after start date');
  }

  // Archive any currently active campaign
  await supabase.from('campaigns').update({ active: false }).eq('active', true);

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      name: input.name,
      description: input.description,
      start_date: input.startDate,
      end_date: input.endDate,
      active: true,
    })
    .select('*')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    active: data.active,
    startDate: data.start_date,
    endDate: data.end_date,
    orderCount: 0,
    totalSales: 0,
  };
}

export async function setActiveCampaign(id: string): Promise<Campaign> {
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!campaign) throw new NotFoundError('Campaign not found');

  await supabase.from('campaigns').update({ active: false }).eq('active', true);
  const { error: upErr } = await supabase.from('campaigns').update({ active: true }).eq('id', id);
  if (upErr) throw upErr;

  const active = await getActiveCampaign();
  if (!active) throw new NotFoundError('Campaign not found');
  return active;
}

export async function archiveCampaign(id: string): Promise<void> {
  const { error } = await supabase.from('campaigns').update({ active: false }).eq('id', id);
  if (error) throw error;
}