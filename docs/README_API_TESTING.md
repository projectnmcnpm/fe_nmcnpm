# Tai lieu test API (input/output, endpoint, mau test truc quan)

Tai lieu nay giup team test API co he thong: endpoint, quyen truy cap, request/response mau, test case thanh cong va that bai.

## 1) Thong tin chung

- Base URL local: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs
- Kieu response thanh cong:

```json
{
  "code": 200,
  "data": {},
  "message": "optional"
}
```

- Kieu response loi (global exception):

```json
{
  "timestamp": "2026-04-20T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "path": "/api/bookings",
  "details": {
    "customerEmail": "customerEmail format invalid"
  }
}
```

## 2) Chuan bi bo test

### 2.1 Cong cu de nghi

- Postman
- Insomnia
- Hoac curl tren terminal

### 2.2 Tao environment Postman

Tao cac bien:

- baseUrl = http://localhost:8080
- accessToken = (de trong luc dau)
- refreshToken = (de trong luc dau)
- bookingId =
- roomId =
- customerId =
- accountId =

### 2.3 Header chuan

- Content-Type: application/json
- Authorization: Bearer {{accessToken}} (voi endpoint can auth)

## 3) Bang endpoint tong hop

### 3.1 Auth

- POST /api/auth/login (public)
- POST /api/auth/register (public)
- POST /api/auth/refresh (public)
- POST /api/auth/logout (can login)

### 3.2 Rooms

- GET /api/rooms (public)
- GET /api/rooms/{id} (public)
- GET /api/rooms/{id}/availability (public)
- POST /api/rooms (MANAGER)
- PUT /api/rooms/{id} (MANAGER)
- PATCH /api/rooms/{id}/status (MANAGER/RECEPTIONIST/CLEANER)
- DELETE /api/rooms/{id} (MANAGER)
- POST /api/rooms/{id}/images (MANAGER)
- POST /api/rooms/{id}/gallery (MANAGER)
- DELETE /api/rooms/{id}/gallery (MANAGER)

### 3.3 Bookings

- GET /api/bookings (MANAGER/RECEPTIONIST/CUSTOMER)
- GET /api/bookings/export (MANAGER/RECEPTIONIST)
- GET /api/bookings/{id} (MANAGER/RECEPTIONIST/CUSTOMER)
- GET /api/bookings/{id}/payment-qr (MANAGER/RECEPTIONIST/CUSTOMER)
- POST /api/bookings (MANAGER/RECEPTIONIST/CUSTOMER)
- PATCH /api/bookings/{id} (MANAGER/RECEPTIONIST)
- PATCH /api/bookings/{id}/status (MANAGER/RECEPTIONIST)
- PATCH /api/bookings/{id}/payment-status (MANAGER/RECEPTIONIST)
- PATCH /api/bookings/{id}/refund-status (MANAGER/RECEPTIONIST)
- PATCH /api/bookings/{id}/cancel (MANAGER/RECEPTIONIST/CUSTOMER)
- DELETE /api/bookings/{id} (MANAGER/RECEPTIONIST)

### 3.4 Customers

- GET /api/customers (MANAGER/RECEPTIONIST)
- POST /api/customers (MANAGER/RECEPTIONIST)
- PATCH /api/customers/{id} (MANAGER/RECEPTIONIST)
- DELETE /api/customers/{id} (MANAGER)

### 3.5 Accounts

- GET /api/accounts (MANAGER)
- POST /api/accounts (MANAGER)
- PATCH /api/accounts/{id} (MANAGER)
- DELETE /api/accounts/{id} (MANAGER)

### 3.6 Cleaner

- GET /api/cleaner/tasks (CLEANER/MANAGER)
- PATCH /api/cleaner/tasks/{id} (CLEANER/MANAGER)
- POST /api/cleaner/issues (CLEANER/MANAGER)

### 3.7 Dashboard

- GET /api/dashboard/admin (MANAGER)
- GET /api/dashboard/staff (MANAGER/RECEPTIONIST)

## 4) Bo request/response mau de test nhanh

### 4.1 Dang nhap

{{baseUrl}}=http://localhost:8080

Request:

```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "admin@homestay.local",
  "password": "Admin@123456"
}
```

Response thanh cong (rut gon):

```json
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "expiresIn": 3600,
    "user": {
      "id": "...",
      "name": "System Admin",
      "email": "admin@homestay.local",
      "role": "manager"
    }
  }
}
```

### 4.2 Refresh token

```http
POST {{baseUrl}}/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "{{refreshToken}}"
}
```

Ky vong:

- 200 va tra token moi.
- Refresh token cu bi revoke (token rotation).

### 4.3 Lay danh sach phong

```http
GET {{baseUrl}}/api/rooms?page=0&size=10&status=available&search=vip
```

Ky vong:

- 200
- data.content la mang phong
- data.totalElements, data.totalPages co gia tri hop le

### 4.4 Tao phong (multipart)

```http
POST {{baseUrl}}/api/rooms
Authorization: Bearer {{accessToken}}
Content-Type: multipart/form-data

name=Phong VIP 01
type=VIP Room
capacity=4
pricePerNight=1200000
pricePerHour=250000
status=available
amenities=["wifi","air_conditioner","tv"]
description=Phong cao cap
coverImage=<file>
```

Ky vong:

- 201
- data.id khac rong
- data.status = available

### 4.5 Tao booking

```http
POST {{baseUrl}}/api/bookings
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "roomId": "{{roomId}}",
  "customerName": "Nguyen Van A",
  "customerEmail": "a@example.com",
  "customerPhone": "0912345678",
  "customerIdNumber": "079123456789",
  "checkIn": "2026-04-21",
  "checkOut": "2026-04-22",
  "checkInTime": "14:00",
  "checkOutTime": "12:00",
  "bookingType": "day",
  "total": 1200000,
  "paymentMethod": "bank",
  "paymentAmount": "30",
  "note": "Khach check-in som neu co the"
}
```

Ky vong:

- 201
- data co bookingId/id
- data.status thuong la upcoming

### 4.6 Lay QR thanh toan booking

```http
GET {{baseUrl}}/api/bookings/{{bookingId}}/payment-qr
Authorization: Bearer {{accessToken}}
```

Ky vong:

- 200
- Tra paymentQrUrl, transferContent, payAmountVnd
- Neu QR het han, he thong co the tu gia han theo cau hinh

### 4.7 Cap nhat trang thai booking

```http
PATCH {{baseUrl}}/api/bookings/{{bookingId}}/status
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "status": "checked_in"
}
```

Ky vong:

- 200
- data.status = checked_in

### 4.8 Huy booking

```http
PATCH {{baseUrl}}/api/bookings/{{bookingId}}/cancel
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "reason": "Khach thay doi lich"
}
```

Ky vong:

- 200
- status chuyen cancelled

### 4.9 Export CSV booking

```http
GET {{baseUrl}}/api/bookings/export?status=checked_out&from=2026-04-01&to=2026-04-30
Authorization: Bearer {{accessToken}}
```

Ky vong:

- 200
- Header Content-Disposition co ten file bookings_export.csv
- Content-Type text/csv; charset=UTF-8
- File co UTF-8 BOM de mo bang Excel

## 5) Test validation (negative test) de bat loi

### 5.1 Login sai dinh dang email

Request:

```json
{
  "email": "not-an-email",
  "password": "12345678"
}
```

Ky vong:

- 400
- code = VALIDATION_ERROR
- details.email = Email is invalid

### 5.2 Tao account role sai

```http
POST {{baseUrl}}/api/accounts
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "email": "staff1@example.com",
  "name": "Staff 1",
  "role": "admin",
  "status": "active",
  "password": "12345678"
}
```

Ky vong:

- 400
- details.role thong bao role khong hop le

### 5.3 Tao booking sai CCCD

```json
{
  "roomId": "{{roomId}}",
  "customerName": "Nguyen Van A",
  "customerEmail": "a@example.com",
  "customerPhone": "0912345678",
  "customerIdNumber": "123456",
  "checkIn": "2026-04-21",
  "checkOut": "2026-04-22",
  "total": 1200000
}
```

Ky vong:

- 400
- details.customerIdNumber = customerIdNumber must be 12 digits

### 5.4 Goi endpoint can role manager bang token customer

Vi du:

- GET /api/accounts

Ky vong:

- 403
- code = FORBIDDEN

## 6) Test matrix theo chuc nang

| Nhom     | Test case            | Input                               | Ket qua mong doi            |
| -------- | -------------------- | ----------------------------------- | --------------------------- |
| Auth     | Login dung           | email/password dung                 | 200 + access/refresh token  |
| Auth     | Login sai pass       | email dung, pass sai                | 401/4xx INVALID_CREDENTIALS |
| Auth     | Refresh hop le       | refreshToken chua revoke            | 200 + token moi             |
| Rooms    | List room            | page,size,status                    | 200 + paged response        |
| Rooms    | Tao room             | multipart dung schema               | 201 + room moi              |
| Bookings | Tao booking          | body hop le                         | 201 + booking moi           |
| Bookings | Update status        | status=checked_in                   | 200 + status moi            |
| Bookings | Export CSV           | filter status/from/to               | 200 + file csv              |
| Accounts | Tao account          | role hop le                         | 201                         |
| Accounts | Tao account role sai | role=admin                          | 400 validation              |
| Security | Khong token          | endpoint private                    | 401/403                     |
| Security | Sai role             | endpoint manager voi token customer | 403                         |

## 7) Script curl de test nhanh tren terminal

### 7.1 Login va lay token

```powershell
$body = @{
  email = "admin@homestay.local"
  password = "Admin@123456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/auth/login" -ContentType "application/json" -Body $body
$response
```

### 7.2 Goi API private voi token

```powershell
$token = "<access_token>"
Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/accounts" -Headers @{ Authorization = "Bearer $token" }
```

## 8) Luong test truc quan (goi y)

Flow de demo cho stakeholder:

1. Login bang admin.
2. Tao 1 phong moi.
3. Tao 1 booking cho phong do.
4. Mo payment QR cua booking.
5. Chuyen trang thai booking upcoming -> checked_in -> checked_out.
6. Export CSV booking theo khoang ngay.
7. Kiem tra dashboard admin/staff thay doi so lieu.

## 9) Cac diem can luu y khi test

- Timezone va format ngay gio co the anh huong ket qua check-in/check-out.
- bookingType day/hour can dong bo voi logic gia.
- paymentAmount thuong dung 30 hoac 100 theo nghiep vu dat coc.
- Neu frontend map status dang so (0/1/2/4/3), can map dung sang chuoi backend truoc khi goi export.

## 10) Checklist truoc khi nghiem thu

- Backend da chay on dinh, ket noi DB thanh cong.
- Co tai khoan manager seed.
- Swagger truy cap duoc.
- Cac endpoint critical (auth, room, booking, export) test pass.
- Co it nhat 1 bo test negative cho moi nhom endpoint.
- Da luu Postman collection + environment de tai su dung.
