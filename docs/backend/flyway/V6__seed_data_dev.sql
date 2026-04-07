-- Dev seed data only. Remove in production.

insert into rooms (room_code, name, room_type, price, price_per_hour, status, cover_image_url, description)
values
  ('RM-101', 'Netflix and Chill Suite', 'Double Room', 650000, 150000, 'available', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2057&auto=format&fit=crop', 'Demo room')
on conflict (room_code) do nothing;

insert into rooms (room_code, name, room_type, price, price_per_hour, status, cover_image_url, description)
values
  ('RM-205', 'Director Cut VIP', 'VIP Room', 950000, 200000, 'few_left', 'https://images.unsplash.com/photo-1598928636135-d146006ff4be?q=80&w=2070&auto=format&fit=crop', 'Demo room')
on conflict (room_code) do nothing;

insert into accounts (account_code, email, full_name, role, status)
values
  ('USR-001', 'quanly@genz.com', 'Quan Ly', 'manager', 'active')
on conflict (account_code) do nothing;

insert into accounts (account_code, email, full_name, role, status)
values
  ('USR-002', 'letan@genz.com', 'Le Tan', 'receptionist', 'active')
on conflict (account_code) do nothing;

insert into customers (customer_code, full_name, phone, cccd, email, color_tag)
values
  ('CS-001', 'Nguyen Van A', '0901234567', '012345678912', 'nguyenvana@email.com', 'bg-blue-500')
on conflict (customer_code) do nothing;

insert into customers (customer_code, full_name, phone, cccd, email, color_tag)
values
  ('CS-002', 'Tran Thi B', '0912345678', '123456789012', 'tranthib@email.com', 'bg-purple-500')
on conflict (customer_code) do nothing;

insert into bookings (
  booking_code,
  room_id,
  room_name_snapshot,
  user_id,
  customer_phone,
  customer_id_number,
  check_in,
  check_out,
  booking_type,
  total,
  status,
  image_url,
  payment_method,
  payment_amount
)
select
  'BO-1001',
  r.id,
  r.name,
  'customer@email.com',
  '0901234567',
  '012345678912',
  current_date + interval '1 day',
  current_date + interval '2 day',
  'day',
  650000,
  'upcoming',
  r.cover_image_url,
  'bank',
  '30'
from rooms r
where r.room_code = 'RM-101'
  and not exists (select 1 from bookings where booking_code = 'BO-1001');
