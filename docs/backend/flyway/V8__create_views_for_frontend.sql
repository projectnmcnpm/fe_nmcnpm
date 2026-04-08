-- Frontend-oriented views
-- Purpose: provide stable read models aligned with FE contract and reduce service-layer mapping logic.

-- 1) Room read model
create or replace view vw_room_read_model as
select
  r.id,
  r.room_code as code,
  r.room_code as "id",
  r.name,
  r.room_type as "type",
  r.price,
  r.price_per_hour as "pricePerHour",
  r.status,
  r.cover_image_url as "image",
  coalesce(
    (
      select json_agg(ri.image_url order by ri.sort_order, ri.id)
      from room_images ri
      where ri.room_id = r.id
    ),
    '[]'::json
  ) as gallery,
  coalesce(
    (
      select json_agg(ra.amenity_name order by ra.id)
      from room_amenities ra
      where ra.room_id = r.id
    ),
    '[]'::json
  ) as amenities,
  coalesce(r.description, '') as description,
  r.created_at,
  r.updated_at
from rooms r
where r.deleted_at is null;

comment on view vw_room_read_model is
  'Read model for FE rooms endpoints; fields are named to match FE contract.';

-- 2) Booking read model
create or replace view vw_booking_read_model as
select
  b.id,
  b.booking_code as code,
  b.booking_code as "id",
  r.room_code as "roomId",
  b.room_name_snapshot as "roomName",
  b.user_id as "userId",
  b.customer_phone as "customerPhone",
  b.customer_id_number as "customerIdNumber",
  to_char(b.check_in, 'YYYY-MM-DD') as "checkIn",
  to_char(b.check_out, 'YYYY-MM-DD') as "checkOut",
  to_char(b.check_in_time, 'HH24:MI') as "checkInTime",
  to_char(b.check_out_time, 'HH24:MI') as "checkOutTime",
  b.booking_type as "bookingType",
  b.total,
  b.status,
  b.image_url as "image",
  b.payment_method as "paymentMethod",
  b.payment_amount as "paymentAmount",
  b.cancel_reason as "cancelReason",
  b.created_at as "createdAt",
  b.updated_at as "updatedAt"
from bookings b
join rooms r on r.id = b.room_id
where b.deleted_at is null;

comment on view vw_booking_read_model is
  'Read model for FE bookings endpoints; stringified date/time fields match FE expectations.';

-- 3) Account read model
create or replace view vw_account_read_model as
select
  a.id,
  a.account_code as code,
  a.account_code as "id",
  a.email,
  a.full_name as "name",
  a.role,
  to_char(a.created_at, 'DD/MM/YYYY') as created,
  a.status,
  a.created_at,
  a.updated_at
from accounts a
where a.deleted_at is null;

comment on view vw_account_read_model is
  'Read model for FE accounts endpoints.';

-- 4) Customer read model
create or replace view vw_customer_read_model as
select
  c.id,
  c.customer_code as code,
  c.customer_code as "id",
  c.full_name as "name",
  c.phone,
  c.cccd,
  coalesce(c.email::text, '') as email,
  coalesce(c.color_tag, 'bg-accent-neon') as color,
  coalesce(
    (
      select count(*)::int
      from bookings b
      where b.customer_id = c.id
        and b.deleted_at is null
    ),
    0
  ) as bookings,
  to_char(c.created_at, 'DD/MM/YYYY') as created,
  coalesce(
    (
      select to_char(max(b.check_in), 'DD/MM/YYYY')
      from bookings b
      where b.customer_id = c.id
        and b.deleted_at is null
    ),
    '-'
  ) as "lastVisit",
  c.created_at,
  c.updated_at
from customers c
where c.deleted_at is null;

comment on view vw_customer_read_model is
  'Read model for FE customers endpoints, including bookings count and last visit.';

-- Helpful indexes for customer stats subqueries
create index if not exists idx_bookings_customer_id_check_in
  on bookings(customer_id, check_in)
  where deleted_at is null;
