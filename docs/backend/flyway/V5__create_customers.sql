create table if not exists customers (
  id bigint generated always as identity primary key,
  customer_code varchar(30) not null unique,
  full_name varchar(255) not null,
  phone varchar(20) not null unique,
  cccd varchar(20) not null unique,
  email varchar(255),
  color_tag varchar(40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_customers_full_name on customers(full_name);
