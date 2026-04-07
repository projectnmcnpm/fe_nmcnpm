create table if not exists bookings (
  id bigint generated always as identity primary key,
  booking_code varchar(30) not null unique,
  room_id bigint not null references rooms(id),
  room_name_snapshot varchar(255) not null,
  user_id varchar(255) not null,
  customer_phone varchar(20),
  customer_id_number varchar(20),
  check_in date not null,
  check_out date not null,
  check_in_time time,
  check_out_time time,
  booking_type booking_type,
  total numeric(12,2) not null check (total >= 0),
  status booking_status not null default 'upcoming',
  image_url text not null,
  payment_method varchar(80),
  payment_amount varchar(40),
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint chk_booking_dates check (check_out >= check_in)
);

create index if not exists idx_bookings_room_id on bookings(room_id);
create index if not exists idx_bookings_user_id on bookings(user_id);
create index if not exists idx_bookings_status on bookings(status);
create index if not exists idx_bookings_checkin_checkout on bookings(check_in, check_out);
