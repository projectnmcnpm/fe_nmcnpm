# Backend Implementation Spec

This document is the full backend implementation guide for this project.
Target stack:

- Spring Boot 3.x
- PostgreSQL 15+
- Cloud image storage (Cloudinary recommended, AWS S3 or GCS acceptable)

This document is aligned with frontend data models and current FE API client behavior.

## 1. Objectives

Backend must provide:

- Stable REST APIs for rooms, bookings, accounts, customers.
- Predictable request/response contracts that FE can consume immediately.
- Validation and business rules (booking dates, status transitions, uniqueness checks).
- Image upload and URL storage in PostgreSQL.
- Clear error contract.

Frontend currently supports both:

- Raw payload response.
- Envelope response format: { "data": ... }

So backend can return either style, but must be consistent across endpoints once chosen.

## 2. Recommended Spring Boot Project Structure

Use package layout:

- com.yourorg.hotel
  - config
  - auth
  - common
    - exception
    - response
    - validation
  - room
    - RoomController
    - RoomService
    - RoomRepository
    - dto
    - entity
  - booking
    - BookingController
    - BookingService
    - BookingRepository
    - dto
    - entity
  - account
    - AccountController
    - AccountService
    - AccountRepository
    - dto
    - entity
  - customer
    - CustomerController
    - CustomerService
    - CustomerRepository
    - dto
    - entity
  - media
    - MediaController
    - CloudStorageService
    - dto

Dependencies:

- spring-boot-starter-web
- spring-boot-starter-validation
- spring-boot-starter-data-jpa
- spring-boot-starter-security (if auth now)
- postgresql
- flyway-core
- lombok (optional)
- mapstruct (optional)
- cloudinary-http44 or aws-sdk-s3 / google-cloud-storage
- springdoc-openapi-starter-webmvc-ui

## 3. PostgreSQL Data Model

Use snake_case table and column names. Use bigint identity for internal PKs and store business IDs separately.

### 3.1 Enum Definitions

Create enum types:

- room_status: available, few_left, full, cleaning
- booking_status: upcoming, active, completed, cancelled
- booking_type: day, hour
- account_role: manager, receptionist, cleaner, customer
- account_status: active, disabled

SQL:

create type room_status as enum ('available','few_left','full','cleaning');
create type booking_status as enum ('upcoming','active','completed','cancelled');
create type booking_type as enum ('day','hour');
create type account_role as enum ('manager','receptionist','cleaner','customer');
create type account_status as enum ('active','disabled');

### 3.2 Tables

#### rooms

- id bigint primary key generated always as identity
- room_code varchar(30) unique not null -- example: RM-101
- name varchar(255) not null
- room_type varchar(100) not null -- FE currently uses labels like Single Room
- price numeric(12,2) not null
- price_per_hour numeric(12,2)
- status room_status not null default 'available'
- cover_image_url text not null
- description text
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Indexes:

- unique(room_code)
- index on status
- trigram index on name, room_code (optional for search)

#### room_images

- id bigint primary key generated always as identity
- room_id bigint not null references rooms(id) on delete cascade
- image_url text not null
- public_id varchar(255) -- for cloud provider deletion/update
- sort_order int not null default 0
- created_at timestamptz not null default now()

Index:

- index(room_id, sort_order)

#### room_amenities

- id bigint primary key generated always as identity
- room_id bigint not null references rooms(id) on delete cascade
- amenity_name varchar(120) not null
- created_at timestamptz not null default now()

Index:

- index(room_id)

#### bookings

- id bigint primary key generated always as identity
- booking_code varchar(30) unique not null -- example: BO-1001
- room_id bigint not null references rooms(id)
- room_name_snapshot varchar(255) not null -- preserve history if room name changes
- user_id varchar(255) not null -- FE currently sends email-like user id
- customer_phone varchar(20)
- customer_id_number varchar(20)
- check_in date not null
- check_out date not null
- check_in_time time
- check_out_time time
- booking_type booking_type
- total numeric(12,2) not null
- status booking_status not null default 'upcoming'
- image_url text not null
- payment_method varchar(80)
- payment_amount varchar(40)
- cancel_reason text
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Indexes:

- unique(booking_code)
- index(room_id)
- index(user_id)
- index(status)
- index(check_in, check_out)

#### accounts

- id bigint primary key generated always as identity
- account_code varchar(30) unique not null -- example: USR-001
- email varchar(255) unique not null
- full_name varchar(255) not null
- role account_role not null
- status account_status not null default 'active'
- password_hash varchar(255) -- if auth now, else nullable temporarily
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Indexes:

- unique(email)
- unique(account_code)
- index(role, status)

#### customers

- id bigint primary key generated always as identity
- customer_code varchar(30) unique not null -- example: CS-001 or KH-001 (pick one convention)
- full_name varchar(255) not null
- phone varchar(20) not null
- cccd varchar(20) not null
- email varchar(255)
- color_tag varchar(40) -- optional UI color
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Indexes:

- unique(customer_code)
- unique(phone)
- unique(cccd)
- index(full_name)

### 3.3 Flyway Migration Order

- V1\_\_create_enums.sql
- V2\_\_create_rooms_and_related.sql
- V3\_\_create_bookings.sql
- V4\_\_create_accounts.sql
- V5\_\_create_customers.sql
- V6\_\_seed_data_dev.sql (optional for local)
- V7\_\_production_hardening.sql
- V8\_\_create_views_for_frontend.sql

## 4. ID Generation Rules

Business IDs must match FE expectations:

- room_code: RM-101 style
- booking_code: BO-1001 style
- account_code: USR-001 style
- customer_code: CS-001 (or KH-001, but keep FE mapping consistent)

Recommended approach:

- Internal PK numeric identity.
- Business code generated in service layer with sequence table or PostgreSQL sequence.

Example:

- booking_code generated from sequence booking_code_seq with format BO-%04d.

## 5. Status and Mapping Rules

FE consumes these values:

### Room status

- available
- few_left
- full
- cleaning

### Booking status

- upcoming
- active
- completed
- cancelled

### Staff numeric status compatibility

FE maps numeric status to string internally:

- 0 -> upcoming (booking) / available (room)
- 1 -> active (booking) / full (room)
- 2 -> completed (booking)
- 3 -> cancelled (booking)
- -1 -> cleaning (room)

Backend should store canonical string enum values.

## 6. API Standard

Base path: /api
Content type: application/json
Timezone: UTC in DB, serialize ISO-8601.

### 6.1 Response Format

Choose one globally:

Option A (raw):

- list endpoint returns array directly
- item endpoint returns object directly

Option B (envelope):

- { "data": ... }

Frontend supports both today.

### 6.2 Error Format

Return structured errors:

{
"timestamp": "2026-04-08T10:00:00Z",
"path": "/api/bookings",
"status": 400,
"error": "Bad Request",
"code": "VALIDATION_ERROR",
"message": "checkOut must be after checkIn",
"details": [
{ "field": "checkOut", "message": "must be after checkIn" }
]
}

Common codes:

- VALIDATION_ERROR
- NOT_FOUND
- CONFLICT
- FORBIDDEN
- UNAUTHORIZED
- INTERNAL_ERROR

## 7. API Endpoints Detailed

All endpoints below are required by FE now.

## 7.1 Rooms

1. GET /api/rooms

- Query:
  - status (optional): room_status
  - search (optional): search by room_code/name
- Response item:
  - id: string (room_code)
  - name: string
  - type: string
  - price: number
  - pricePerHour: number|null
  - status: room_status
  - image: string
  - gallery: string[]
  - amenities: string[]
  - description: string

2. GET /api/rooms/{id}

- id uses room_code (example RM-101)
- 404 if not found

3. PATCH /api/rooms/{id}/status

- Body:
  - status: room_status
- Validation:
  - status required
  - room exists
- Response: updated room object

4. DELETE /api/rooms/{id}

- Soft delete recommended if there are historical bookings.
- If hard delete and related bookings exist, return 409 with clear message.
- Response: 204 or { data: true }

## 7.2 Bookings

1. GET /api/bookings

- Query:
  - userId (optional)
  - status (optional)
  - roomId (optional, use room_code)
- Response item:
  - id: string (booking_code)
  - roomId: string
  - roomName: string
  - userId: string
  - customerPhone: string|null
  - customerIdNumber: string|null
  - checkIn: yyyy-MM-dd
  - checkOut: yyyy-MM-dd
  - checkInTime: HH:mm|null
  - checkOutTime: HH:mm|null
  - bookingType: day|hour|null
  - total: number
  - status: booking_status
  - image: string
  - paymentMethod: string|null
  - paymentAmount: string|null
  - cancelReason: string|null
  - createdAt: ISO datetime

2. GET /api/bookings/{id}

- id uses booking_code
- 404 if not found

3. POST /api/bookings

- Body fields:
  - roomId required
  - roomName optional (backend can derive from room)
  - userId required
  - customerPhone optional but validate if present
  - customerIdNumber optional but validate if present
  - checkIn required
  - checkOut required
  - checkInTime optional
  - checkOutTime optional
  - bookingType optional
  - total required
  - status optional (default upcoming)
  - image optional (can derive from room cover)
  - paymentMethod optional
  - paymentAmount optional
  - cancelReason optional
- Validation rules:
  - checkOut >= checkIn
  - if bookingType=day then checkOut > checkIn
  - if bookingType=hour then checkInTime/checkOutTime required
  - phone regex: ^(0\\d{9,10}|\\+84\\d{9,10})$
  - id number regex: ^\\d{12}$
  - room must exist
  - room availability check optional in phase 1, required in phase 2
- Response: created booking object with generated booking_code

4. PATCH /api/bookings/{id}/status

- Body:
  - status: booking_status
- Transition rules recommended:
  - upcoming -> active|cancelled
  - active -> completed|cancelled
  - completed -> no transition
  - cancelled -> no transition
- If invalid transition, return 409

5. PATCH /api/bookings/{id}/cancel

- Body:
  - reason: string optional
- Behavior:
  - set status=cancelled
  - set cancel_reason

6. DELETE /api/bookings/{id}

- Recommended soft delete using deleted_at
- FE accepts 204 or { data: true }

## 7.3 Accounts

1. GET /api/accounts

- Response item:
  - id (account_code)
  - email
  - name
  - role: manager|receptionist|cleaner|customer
  - created (date string)
  - status: active|disabled

2. POST /api/accounts

- Body:
  - email required unique
  - name required
  - role required
  - status optional default active
- Optional password flow:
  - if provided, hash with BCrypt

3. PATCH /api/accounts/{id}

- Partial update fields:
  - name, email, role, status

4. DELETE /api/accounts/{id}

- Prefer soft delete if auth/audit required

## 7.4 Customers

1. GET /api/customers

- Response item:
  - id (customer_code)
  - name
  - phone
  - cccd
  - email
  - bookings (computed count or stored)
  - created optional
  - lastVisit optional
  - color optional

2. POST /api/customers

- Body:
  - name required
  - phone required unique
  - cccd required unique
  - email optional
  - created optional
  - lastVisit optional
  - color optional

3. PATCH /api/customers/{id}

- Partial update fields above

4. DELETE /api/customers/{id}

- Soft delete recommended

## 8. Image Storage on Cloud

Use one of:

- Cloudinary (simple URL-based integration)
- AWS S3
- Google Cloud Storage

Recommended implementation pattern:

- Upload endpoint:
  - POST /api/media/images
  - multipart/form-data file
- Response:
  - url
  - publicId
  - width, height (optional)

Store in DB:

- cover_image_url on rooms
- room_images.image_url for gallery
- optional public_id for later delete/update

Security controls:

- max file size (example 5MB)
- allowed mime types: image/jpeg, image/png, image/webp
- virus scanning optional (production)

## 9. Validation Rules Summary

Room:

- room_code unique non-empty
- name non-empty
- price >= 0
- price_per_hour >= 0

Booking:

- roomId required
- userId required
- checkIn/checkOut required and valid order
- total >= 0
- status enum only

Account:

- email valid unique
- role enum

Customer:

- phone unique, format check
- cccd unique, 12 digits

## 10. Transaction and Consistency Rules

When creating booking:

- Transaction boundary in service layer.
- Load room by room_code.
- Persist booking with room_name_snapshot and image snapshot.
- Optionally update room status based on occupancy policy.

When status changes:

- Optionally update room status if business requires.

When deleting:

- Keep audit if possible (soft delete + deleted_at + deleted_by).

## 11. Security (Recommended)

Phase 1 (fast integration):

- Allow all endpoints in dev, CORS configured for FE host.

Phase 2 (production):

- JWT authentication.
- Role-based authorization:
  - manager: all admin endpoints
  - receptionist: booking/customer operations
  - cleaner: room status update only

CORS:

- Allow FE origin from config (not wildcard in production)

## 12. Pagination and Filtering (Recommended Upgrade)

Current FE can consume full arrays.
For scalability, add paginated versions:

- GET /api/bookings?page=0&size=20&status=active
- GET /api/rooms?page=0&size=20&status=available

Response:

- data: []
- page, size, totalElements, totalPages

If adding pagination later, keep old endpoint behavior or make FE update together.

## 13. OpenAPI and Testing

Enable OpenAPI:

- /swagger-ui.html
- /v3/api-docs

Test checklist before FE integration:

- status enums exactly match FE values
- date formats match (yyyy-MM-dd for checkIn/checkOut)
- deletion endpoints return 204 or data=true
- account/customer endpoints return id fields as FE expects
- upload endpoint returns stable public URL

## 14. Application Config Template

application.yml (example keys):

- spring.datasource.url
- spring.datasource.username
- spring.datasource.password
- spring.jpa.hibernate.ddl-auto=validate
- spring.jpa.properties.hibernate.jdbc.time_zone=UTC
- spring.flyway.enabled=true
- app.cors.allowed-origins
- app.cloud.provider=cloudinary
- app.cloud.cloudinary.cloud-name
- app.cloud.cloudinary.api-key
- app.cloud.cloudinary.api-secret

## 15. Implementation Order for Backend Team

1. Setup project + PostgreSQL + Flyway.
2. Implement enums + entities + repositories.
3. Implement rooms APIs.
4. Implement bookings APIs with validation.
5. Implement accounts APIs.
6. Implement customers APIs.
7. Implement cloud upload API and wire room image flow.
8. Add OpenAPI and integration tests.
9. Connect FE by setting NEXT_PUBLIC_USE_MOCK_DATA=false.

## 16. Final FE Integration Checklist

- Set FE env:
  - NEXT_PUBLIC_USE_MOCK_DATA=false
  - NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
- Run backend.
- Verify FE pages:
  - /rooms, /rooms/{id}
  - /history
  - /admin/bookings, /admin/rooms, /admin/accounts, /admin/customers
  - /staff/bookings, /staff/rooms, /staff/customers
  - /cleaner/dashboard

If all above pass, mock-only mode can be retired for staging/production.
