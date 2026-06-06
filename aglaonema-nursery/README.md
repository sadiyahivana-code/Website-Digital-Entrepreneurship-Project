# 🌿 Aglaonema Nursery

Website toko tanaman Aglaonema premium dengan fitur lengkap — fullstack React + Node.js + PostgreSQL.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS (custom palette) |
| State | Zustand + React Query |
| Animasi | Framer Motion |
| Peta | React Leaflet + OpenStreetMap |
| PDF | @react-pdf/renderer + jsPDF |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (httpOnly cookie, user & admin terpisah) |

---

## 🚀 Cara Setup

### 1. Prasyarat
- Node.js v18+
- PostgreSQL (running lokal atau cloud)
- Git

### 2. Clone & Install
```bash
git clone <repo-url>
cd aglaonema-nursery

# Install semua dependency sekaligus
npm run install:all
```

### 3. Setup Database

Buat database PostgreSQL baru:
```sql
CREATE DATABASE aglaonema_nursery;
```

### 4. Konfigurasi Environment

```bash
# Salin file env
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/aglaonema_nursery"
JWT_USER_SECRET="ganti-dengan-string-acak-panjang-minimal-32-karakter"
JWT_ADMIN_SECRET="ganti-dengan-string-acak-berbeda-minimal-32-karakter"
PORT=5000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

### 5. Prisma Migration & Seed

```bash
# Masuk ke folder server
cd server

# Jalankan migrasi database
npx prisma generate
npx prisma migrate dev --name init

# Isi data awal (produk, admin, lokasi toko)
npx tsx src/lib/seed.ts
```

### 6. Jalankan Aplikasi

```bash
# Kembali ke root
cd ..

# Jalankan frontend + backend bersamaan
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Prisma Studio:** `npm run db:studio`

---

## 🔐 Akun Default

| Role | Email | Password |
|---|---|---|
| Admin | admin@aglaonema.id | Admin123! |

---

## 📁 Struktur Proyek

```
aglaonema-nursery/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # Layout, Navbar, AdminLayout, Guards
│   │   │   └── ui/           # ProductCard, CartDrawer, StarRating, Skeleton
│   │   ├── pages/
│   │   │   ├── admin/        # Dashboard, Products, Orders, Users, Reports
│   │   │   └── *.tsx         # Home, Products, Cart, Checkout, Payment, dll
│   │   ├── stores/           # Zustand stores (auth, cart)
│   │   └── lib/              # API instance, utils
│   └── tailwind.config.js    # Custom color palette
│
├── server/                   # Express backend
│   └── src/
│       ├── routes/
│       │   ├── admin/        # products, orders, users, reports
│       │   └── *.ts          # auth, cart, orders, products, stores
│       ├── middleware/       # JWT auth middleware
│       └── lib/              # Prisma client, seed
│
└── prisma/
    └── schema.prisma         # Database schema
```

---

## 🎨 Palet Warna

| Nama | Hex | Penggunaan |
|---|---|---|
| Forest | `#1B4332` | Warna utama, CTA, header |
| Gold | `#C9B26B` | Aksen, badge, highlight |
| Cream | `#F8F4EE` | Background, card |
| Bark | `#2D1B00` | Teks body |

---

## 🌐 API Endpoints

### User
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
PUT  /api/auth/profile
PUT  /api/auth/password
```

### Produk
```
GET  /api/products              # dengan filter & pagination
GET  /api/products/categories
GET  /api/products/:slug
POST /api/products/:id/reviews  # butuh login
```

### Cart
```
GET    /api/cart
POST   /api/cart/add
PUT    /api/cart/item/:id
DELETE /api/cart/item/:id
POST   /api/cart/merge          # merge guest cart
```

### Pesanan
```
POST /api/orders
GET  /api/orders
GET  /api/orders/:id
POST /api/orders/:id/payment-proof
```

### Admin (semua butuh admin token)
```
GET /api/admin/reports/dashboard
GET /api/admin/reports
GET/POST/PUT /api/admin/products
GET/PUT      /api/admin/orders
GET/PUT      /api/admin/users
```

---

## ✨ Fitur Utama

- ✅ Autentikasi user & admin terpisah (JWT httpOnly cookie)
- ✅ Katalog produk dengan filter, sort, search, pagination
- ✅ Keranjang (localStorage untuk guest, sync ke DB saat login)
- ✅ Checkout dengan form pengiriman & pilihan ekspedisi
- ✅ Pembayaran manual (Transfer Bank, QRIS dummy, COD)
- ✅ Upload bukti pembayaran
- ✅ Generate & download invoice PDF
- ✅ Peta interaktif lokasi toko (Leaflet + OpenStreetMap)
- ✅ Admin dashboard dengan chart Recharts
- ✅ Manajemen produk, pesanan, user
- ✅ Laporan penjualan + export Excel & PDF
- ✅ Animasi Framer Motion
- ✅ Desain responsif mobile-friendly

---

## 📦 Menambah Produk Baru

Lewat Admin Panel: `/admin/products` → klik **Tambah Produk**

Atau lewat seed: edit `server/src/lib/seed.ts` lalu jalankan:
```bash
cd server && npx tsx src/lib/seed.ts
```

---

## 🐛 Troubleshooting

**Port sudah dipakai:**
```bash
# Ganti PORT di server/.env
PORT=5001
# Ganti proxy di client/vite.config.ts
```

**Prisma error:**
```bash
cd server
npx prisma generate
npx prisma migrate reset
```

**Leaflet icon tidak muncul:**
Sudah dihandle dengan `DivIcon` custom — tidak perlu config tambahan.
