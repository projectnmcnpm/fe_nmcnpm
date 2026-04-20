# Huong dan cai dat va chay Frontend (Next.js)

Tai lieu nay huong dan chi tiet cach cai dat, chay, build va troubleshoot frontend cho project.

## 1) Tong quan

- Framework: Next.js (App Router)
- Ngon ngu: TypeScript
- Package manager: npm
- Thu muc frontend: root cua workspace (khong nam trong backend/Homestay)

## 2) Yeu cau moi truong

- Node.js: khuyen nghi 20.x LTS (toi thieu 18.18+)
- npm: khuyen nghi 9+
- Backend API dang chay (mac dinh http://localhost:8080)

Kiem tra nhanh:

```powershell
node -v
npm -v
```

## 3) Cai dat dependency

Tai root project:

```powershell
npm install
```

Neu gap loi lockfile/cache:

```powershell
npm cache verify
```

## 4) Cau hinh bien moi truong frontend

Frontend su dung bien sau:

- NEXT_PUBLIC_API_BASE_URL

Tao file .env.local tai root project voi noi dung:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Giai thich:

- Bien nay duoc dung de goi backend API.
- Neu de trong, frontend se goi path tuong doi (de gay loi khi backend khac host/port).

## 5) Chay development

```powershell
npm run dev
```

Mo trinh duyet:

- http://localhost:3000

## 6) Build production va run production

Build:

```powershell
npm run build
```

Run:

```powershell
npm run start
```

Mac dinh app chay tren port 3000 (co the doi bang bien PORT).

## 7) Scripts hien co

Trong package.json:

- dev: next dev
- build: next build
- start: next start
- lint: eslint .
- clean: next clean

Lenh thuong dung:

```powershell
npm run lint
```

## 8) Dang nhap va auth tren frontend

Frontend luu phien dang nhap trong localStorage voi khoa genz_auth_session.

Co che token:

- Access token duoc gan vao header Authorization: Bearer <token> cho cac API can auth.
- Neu 401, frontend tu dong goi /api/auth/refresh de lay token moi (token rotation).
- Neu refresh that bai, frontend xoa session va yeu cau dang nhap lai.

## 9) Cac man hinh chinh

- Public:
  - /login
  - /rooms
  - /rooms/[id]
  - /history
- Admin:
  - /admin/dashboard
  - /admin/rooms
  - /admin/bookings
  - /admin/customers
  - /admin/accounts
- Staff:
  - /staff/dashboard
  - /staff/rooms
  - /staff/bookings
  - /staff/customers
- Cleaner:
  - /cleaner/dashboard

## 10) Kiem tra ket noi frontend -> backend

Checklist nhanh:

1. Backend da chay o http://localhost:8080.
2. NEXT_PUBLIC_API_BASE_URL trong .env.local dung host/port.
3. CORS backend cho phep origin frontend:
   - http://localhost:3000
   - http://127.0.0.1:3000

Trieu chung thuong gap:

- Frontend hien thong bao khong ket noi duoc API backend:
  - Kiem tra backend da start chua.
  - Kiem tra URL API base.
  - Kiem tra CORS trong backend.

## 11) Loi thuong gap va cach xu ly

### Loi 1: Port 3000 dang bi chiem

```powershell
$env:PORT=3001
npm run dev
```

### Loi 2: Module install khong day du

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

### Loi 3: Dang nhap thanh cong nhung API sau do bi 401

- Kiem tra dong ho he thong (neu lech nhieu co the token bi coi het han).
- Kiem tra JWT_SECRET/JWT_EXPIRATION_MS ben backend.
- Dang xuat, dang nhap lai.

## 12) Quy trinh de nghi cho team

1. Chay backend truoc.
2. Tao file .env.local cho frontend.
3. npm install.
4. npm run dev.
5. Dang nhap bang tai khoan seed admin tu backend.

## 13) Kiem thu nhanh sau khi chay

- Mo trang /login va dang nhap thanh cong.
- Mo /admin/dashboard (neu role manager).
- Mo danh sach phong /rooms.
- Tao/sua booking va kiem tra du lieu cap nhat.
- Kiem tra export CSV booking.

## 14) Ghi chu van hanh

- Chi dung NEXT_PUBLIC_API_BASE_URL tro den backend tin cay.
- Khong commit .env.local len git.
- Neu deploy, dat bien moi truong tren he thong CI/CD (khong hardcode).
