# API Contract (FE -> BE)

Frontend currently calls these endpoints via `lib/api-client.ts`.

## Base URL

- From env: `NEXT_PUBLIC_API_BASE_URL`
- Example: `http://localhost:8080`

## Rooms

1. `GET /api/rooms`

- Query (optional): `status`, `search`
- Response:

```json
[
  {
    "id": "RM-101",
    "name": "Netflix & Chill Suite",
    "type": "Double Room",
    "price": 650000,
    "pricePerHour": 150000,
    "status": "available",
    "image": "https://...",
    "gallery": [],
    "amenities": [],
    "description": "..."
  }
]
```

2. `GET /api/rooms/:id`

- Response: same room shape as above.

3. `PATCH /api/rooms/:id/status`

- Body:

```json
{ "status": "available" }
```

- Allowed status: `available | few_left | full | cleaning`

4. `DELETE /api/rooms/:id`

- Response: `204 No Content` or `{ "data": true }`

## Bookings

1. `GET /api/bookings`

- Query (optional): `userId`, `status`, `roomId`
- Response:

```json
[
  {
    "id": "BO-1001",
    "roomId": "RM-101",
    "roomName": "Netflix & Chill Suite",
    "userId": "user@email.com",
    "customerPhone": "090...",
    "customerIdNumber": "012...",
    "checkIn": "2026-04-08",
    "checkOut": "2026-04-09",
    "checkInTime": "14:00",
    "checkOutTime": "12:00",
    "bookingType": "day",
    "total": 650000,
    "status": "upcoming",
    "image": "https://...",
    "paymentMethod": "bank",
    "paymentAmount": "30",
    "cancelReason": "...",
    "createdAt": "2026-04-08T09:00:00.000Z"
  }
]
```

2. `GET /api/bookings/:id`

- Response: same booking shape as above.

3. `POST /api/bookings`

- Body: booking object without `id`.
- Response: created booking object with `id`.

4. `PATCH /api/bookings/:id/status`

- Body:

```json
{ "status": "active" }
```

- Allowed status: `upcoming | active | completed | cancelled`

5. `PATCH /api/bookings/:id/cancel`

- Body:

```json
{ "reason": "Khong di duoc" }
```

6. `DELETE /api/bookings/:id`

- Response: `204 No Content` or `{ "data": true }`

## Accounts

1. `GET /api/accounts`

2. `POST /api/accounts`

- Body:

```json
{
  "email": "letan@genz.com",
  "name": "Le Tan",
  "role": "receptionist",
  "status": "active"
}
```

3. `PATCH /api/accounts/:id`

4. `DELETE /api/accounts/:id`

## Customers

1. `GET /api/customers`

2. `POST /api/customers`

- Body:

```json
{
  "name": "Nguyen Van A",
  "phone": "0901234567",
  "cccd": "012345678912",
  "email": "abc@email.com"
}
```

3. `PATCH /api/customers/:id`

4. `DELETE /api/customers/:id`

## Envelope (optional)

Backend can return either raw data or wrapped data:

```json
{ "data": ... }
```

Both are supported by `api-client`.
