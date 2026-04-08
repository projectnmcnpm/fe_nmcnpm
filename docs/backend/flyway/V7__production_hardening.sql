-- Production hardening migration
-- This migration upgrades V1..V6 schema to be safer for real-world usage.

-- 1) Extensions for better text search and case-insensitive email handling
create extension if not exists pg_trgm;
create extension if not exists citext;

-- 2) Ensure rooms has soft-delete marker
alter table rooms
  add column if not exists deleted_at timestamptz;

-- 3) Convert hard unique constraints to partial unique indexes for soft-delete tables
-- Accounts
alter table accounts alter column email type citext;
alter table accounts drop constraint if exists accounts_account_code_key;
alter table accounts drop constraint if exists accounts_email_key;

create unique index if not exists uq_accounts_code_active
  on accounts(account_code)
  where deleted_at is null;

create unique index if not exists uq_accounts_email_active
  on accounts(email)
  where deleted_at is null;

-- Customers
alter table customers alter column email type citext;
alter table customers drop constraint if exists customers_customer_code_key;
alter table customers drop constraint if exists customers_phone_key;
alter table customers drop constraint if exists customers_cccd_key;

create unique index if not exists uq_customers_code_active
  on customers(customer_code)
  where deleted_at is null;

create unique index if not exists uq_customers_phone_active
  on customers(phone)
  where deleted_at is null;

create unique index if not exists uq_customers_cccd_active
  on customers(cccd)
  where deleted_at is null;

-- Rooms
alter table rooms drop constraint if exists rooms_room_code_key;
create unique index if not exists uq_rooms_code_active
  on rooms(room_code)
  where deleted_at is null;

-- Bookings
alter table bookings drop constraint if exists bookings_booking_code_key;
create unique index if not exists uq_bookings_code_active
  on bookings(booking_code)
  where deleted_at is null;

-- 4) Add customer relation while keeping snapshot fields
alter table bookings
  add column if not exists customer_id bigint;

alter table bookings
  drop constraint if exists fk_bookings_customer;

alter table bookings
  add constraint fk_bookings_customer
  foreign key (customer_id) references customers(id) on delete set null;

create index if not exists idx_bookings_customer_id on bookings(customer_id);

-- 5) Booking business constraints
-- Phone and ID format constraints are nullable-safe
alter table bookings
  drop constraint if exists chk_bookings_customer_phone_format;

alter table bookings
  add constraint chk_bookings_customer_phone_format
  check (
    customer_phone is null
    or customer_phone ~ '^(0[0-9]{9,10}|\\+84[0-9]{9,10})$'
  );

alter table bookings
  drop constraint if exists chk_bookings_customer_id_number_format;

alter table bookings
  add constraint chk_bookings_customer_id_number_format
  check (
    customer_id_number is null
    or customer_id_number ~ '^[0-9]{12}$'
  );

-- If booking_type is hour, times are required
alter table bookings
  drop constraint if exists chk_bookings_time_required_for_hour;

alter table bookings
  add constraint chk_bookings_time_required_for_hour
  check (
    booking_type is null
    or booking_type <> 'hour'
    or (check_in_time is not null and check_out_time is not null)
  );

-- If booking_type is day, check_out must be strictly after check_in
alter table bookings
  drop constraint if exists chk_bookings_day_must_span_at_least_one_day;

alter table bookings
  add constraint chk_bookings_day_must_span_at_least_one_day
  check (
    booking_type is null
    or booking_type <> 'day'
    or check_out > check_in
  );

-- 6) Keep updated_at fresh automatically
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Rooms trigger
DROP TRIGGER IF EXISTS trg_rooms_set_updated_at ON rooms;
create trigger trg_rooms_set_updated_at
before update on rooms
for each row execute function set_updated_at();

-- Bookings trigger
DROP TRIGGER IF EXISTS trg_bookings_set_updated_at ON bookings;
create trigger trg_bookings_set_updated_at
before update on bookings
for each row execute function set_updated_at();

-- Accounts trigger
DROP TRIGGER IF EXISTS trg_accounts_set_updated_at ON accounts;
create trigger trg_accounts_set_updated_at
before update on accounts
for each row execute function set_updated_at();

-- Customers trigger
DROP TRIGGER IF EXISTS trg_customers_set_updated_at ON customers;
create trigger trg_customers_set_updated_at
before update on customers
for each row execute function set_updated_at();

-- 7) Search indexes
create index if not exists idx_rooms_name_trgm
  on rooms using gin (name gin_trgm_ops)
  where deleted_at is null;

create index if not exists idx_rooms_code_trgm
  on rooms using gin (room_code gin_trgm_ops)
  where deleted_at is null;

create index if not exists idx_customers_name_trgm
  on customers using gin (full_name gin_trgm_ops)
  where deleted_at is null;

create index if not exists idx_accounts_name_trgm
  on accounts using gin (full_name gin_trgm_ops)
  where deleted_at is null;
