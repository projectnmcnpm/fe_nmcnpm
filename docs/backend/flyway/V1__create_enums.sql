-- Enums
create type room_status as enum ('available','few_left','full','cleaning');
create type booking_status as enum ('upcoming','active','completed','cancelled');
create type booking_type as enum ('day','hour');
create type account_role as enum ('manager','receptionist','cleaner','customer');
create type account_status as enum ('active','disabled');
