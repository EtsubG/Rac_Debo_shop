-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PRODUCTS
-- ============================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  category text not null check (category in ('T-Shirt','Hoodie','Tote Bag','Cap','Mug')),
  image text not null default '',
  target int not null default 0 check (target >= 0),
  current_orders int not null default 0 check (current_orders >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- PRODUCT VARIANTS
-- ============================================
create table if not exists product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  color text not null,
  hex text not null default '#000000',
  sizes text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_variants_product_id on product_variants(product_id);

-- ============================================
-- CAMPAIGNS
-- ============================================
create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null default '',
  active boolean not null default false,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now()
);

-- Only one active campaign at a time
create unique index if not exists idx_campaigns_single_active
  on campaigns(active) where active = true;

-- ============================================
-- ORDERS
-- ============================================
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  campaign_id uuid references campaigns(id) on delete set null,
  customer_name text not null,
  phone text not null,
  telegram text not null,
  notes text,
  total numeric(10,2) not null default 0 check (total >= 0),
  status text not null default 'Awaiting Payment'
    check (status in ('Awaiting Payment','Proof Uploaded','Paid','Confirmed','Production','Ready','Delivered')),
  proof_url text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_order_number on orders(order_number);
create index if not exists idx_orders_phone on orders(phone);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_campaign_id on orders(campaign_id);
create index if not exists idx_orders_created_at on orders(created_at desc);

-- ============================================
-- ORDER ITEMS
-- ============================================
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_title text not null,
  color text not null,
  size text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on order_items(order_id);

-- ============================================
-- ADMIN USERS
-- ============================================
create table if not exists admin_users (
  id uuid primary key default uuid_generate_v4(),
  username text not null unique,
  email text not null unique,
  password_hash text not null,
  role text not null default 'admin' check (role in ('super','admin')),
  created_at timestamptz not null default now()
);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at before update on products
  for each row execute function set_updated_at();

drop trigger if exists trg_orders_updated_at on orders;
create trigger trg_orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- ============================================
-- AUTO-INCREMENT PRODUCT CURRENT_ORDERS
-- ============================================
create or replace function increment_product_orders()
returns trigger as $$
begin
  update products
  set current_orders = current_orders + new.quantity
  where id = new.product_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_order_items_increment on order_items;
create trigger trg_order_items_increment after insert on order_items
  for each row execute function increment_product_orders();

-- ============================================
-- SEED DATA (optional — matches frontend mockData)
-- ============================================
insert into campaigns (id, name, description, active, start_date, end_date)
values
  ('11111111-1111-1111-1111-111111111111', 'Campaign 1', 'Fall 2026 community service fundraiser — our first merchandise pre-order drive.', true, '2026-09-01', '2026-09-30'),
  ('22222222-2222-2222-2222-222222222222', 'Campaign 0 (Pilot)', 'Spring 2026 pilot run — limited items, internal members only.', false, '2026-03-01', '2026-04-15')
on conflict (id) do nothing;

insert into products (id, title, description, price, category, image, target, current_orders, active)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Classic Logo T-Shirt', 'Premium cotton tee with embroidered Rotaract Club of Debo logo.', 650, 'T-Shirt', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800', 100, 67, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Rotaract Club Hoodie', 'Warm fleece-lined hoodie with raised club crest.', 1200, 'Hoodie', 'https://images.pexels.com/photos/8217427/pexels-photo-8217427.jpeg?auto=compress&cs=tinysrgb&w=800', 80, 34, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Canvas Tote Bag', 'Eco-friendly canvas bag with screen-printed club slogan.', 350, 'Tote Bag', 'https://images.pexels.com/photos/1201033/pexels-photo-1201033.jpeg?auto=compress&cs=tinysrgb&w=800', 150, 112, true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Embroidered Club Cap', 'Adjustable snapback cap with stitched club initials.', 400, 'Cap', 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=800', 60, 18, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Rotaract Coffee Mug', 'Ceramic mug with wrap-around club artwork.', 250, 'Mug', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800', 100, 45, true)
on conflict (id) do nothing;

insert into product_variants (product_id, color, hex, sizes, active)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cranberry Red', '#D91B5C', ARRAY['S','M','L','XL','XXL'], true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Navy Blue', '#1D2939', ARRAY['S','M','L','XL','XXL'], true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'White', '#FFFFFF', ARRAY['M','L','XL'], true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Navy Blue', '#1D2939', ARRAY['S','M','L','XL','XXL'], true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Cranberry Red', '#D91B5C', ARRAY['M','L','XL'], true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Natural', '#e8dccc', ARRAY['One Size'], true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Navy Blue', '#1D2939', ARRAY['One Size'], true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Navy Blue', '#1D2939', ARRAY['Adjustable'], true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'White', '#FFFFFF', ARRAY['Adjustable'], true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'White', '#FFFFFF', ARRAY['11oz'], true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Navy Blue', '#1D2939', ARRAY['11oz'], true)
on conflict do nothing;