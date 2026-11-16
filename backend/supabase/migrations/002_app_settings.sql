-- ============================================
-- APP SETTINGS
-- A single-row key/value config table.
-- ============================================
create table if not exists app_settings (
  key   text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function set_app_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_app_settings_updated_at on app_settings;
create trigger trg_app_settings_updated_at before update on app_settings
  for each row execute function set_app_settings_updated_at();

-- Seed the default payment info row.
-- The super admin can update these values later.
insert into app_settings (key, value)
values (
  'payment_info',
  '{"telebirrNumber": "", "cbeAccount": "", "accountName": "Rotaract Club of Debo"}'::jsonb
)
on conflict (key) do nothing;
