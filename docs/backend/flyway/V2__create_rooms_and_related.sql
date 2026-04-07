-- Rooms
create table if not exists rooms (
  id bigint generated always as identity primary key,
  room_code varchar(30) not null unique,
  name varchar(255) not null,
  room_type varchar(100) not null,
  price numeric(12,2) not null check (price >= 0),
  price_per_hour numeric(12,2) check (price_per_hour is null or price_per_hour >= 0),
  status room_status not null default 'available',
  cover_image_url text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rooms_status on rooms(status);

-- Gallery images
create table if not exists room_images (
  id bigint generated always as identity primary key,
  room_id bigint not null references rooms(id) on delete cascade,
  image_url text not null,
  public_id varchar(255),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_room_images_room_id_sort on room_images(room_id, sort_order);

-- Amenities
create table if not exists room_amenities (
  id bigint generated always as identity primary key,
  room_id bigint not null references rooms(id) on delete cascade,
  amenity_name varchar(120) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_room_amenities_room_id on room_amenities(room_id);
