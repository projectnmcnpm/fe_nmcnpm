create table if not exists accounts (
  id bigint generated always as identity primary key,
  account_code varchar(30) not null unique,
  email varchar(255) not null unique,
  full_name varchar(255) not null,
  role account_role not null,
  status account_status not null default 'active',
  password_hash varchar(255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_accounts_role_status on accounts(role, status);
