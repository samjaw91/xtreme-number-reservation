create extension if not exists pgcrypto;

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  title_ar text not null,
  slug text unique,
  description_ar text,
  instructions_ar text,
  status text not null default 'draft' check (status in ('draft','open','closed','archived')),
  starts_at timestamptz,
  ends_at timestamptz,
  max_numbers_per_user integer not null default 1,
  pending_timeout_minutes integer not null default 60,
  allow_multi_select boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text not null,
  normalized_phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_participants_normalized_phone on participants(normalized_phone);

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  request_code text not null unique,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','confirmed','rejected','expired','cancelled')),
  payment_status text not null default 'under_review' check (payment_status in ('unpaid','under_review','verified','rejected','pending','not_required')),
  submitted_at timestamptz not null default now(),
  expires_at timestamptz,
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_reservations_status on reservations(status);
create index if not exists idx_reservations_code on reservations(request_code);

create table if not exists campaign_numbers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  number_value integer not null,
  current_status text not null default 'available' check (current_status in ('available','pending','confirmed')),
  current_reservation_id uuid references reservations(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique(campaign_id, number_value)
);

create table if not exists reservation_items (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  campaign_number_id uuid not null references campaign_numbers(id) on delete cascade,
  number_value integer not null,
  item_status text not null default 'pending' check (item_status in ('pending','confirmed','rejected','expired','cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists idx_reservation_items_reservation on reservation_items(reservation_id);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  payment_method text,
  payment_reference text,
  amount numeric(10,2),
  currency text,
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  proof_url text,
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists app_settings (
  id uuid primary key default gen_random_uuid(),
  site_name_ar text default 'منصّة الحجز الذكي',
  support_phone text,
  legal_notice_ar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_display_name text,
  action_type text not null,
  entity_type text not null,
  entity_id text not null,
  before_data jsonb,
  after_data jsonb,
  note text,
  created_at timestamptz not null default now()
);

insert into campaigns (title_ar, slug, description_ar, instructions_ar, status, max_numbers_per_user, pending_timeout_minutes)
select 'حملة الحجز الرئيسية', 'main-campaign', 'اختر الأرقام المتاحة وأرسل طلبك ليتم مراجعته من قبل الإدارة.', 'بعد إرسال الطلب يتم إبقاء الأرقام في حالة قيد المراجعة حتى التحقق من الدفع يدوياً.', 'open', 2, 120
where not exists (select 1 from campaigns where slug = 'main-campaign');

insert into campaign_numbers (campaign_id, number_value, current_status)
select c.id, gs, 'available'
from campaigns c
cross join generate_series(1,42) gs
where c.slug = 'main-campaign'
and not exists (
  select 1 from campaign_numbers cn where cn.campaign_id = c.id and cn.number_value = gs
);

insert into app_settings (site_name_ar, support_phone, legal_notice_ar)
select 'منصّة الحجز الذكي', '', 'هذه المنصة مخصصة لإدارة حجوزات الأرقام والطلبات. يُنصح بمراجعة الأنظمة والقوانين المحلية قبل إطلاق أي حملة مدفوعة أو تتضمن جوائز أو عناصر قائمة على الحظ.'
where not exists (select 1 from app_settings);
