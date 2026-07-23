# Dokumentasi API Sikamali
**Sistem Informasi Kependudukan Masyarakat Lingkar Tambang**

> Base URL: `http://localhost:3000/api`

---

## Autentikasi

Sistem menggunakan **JWT Bearer Token**. Semua endpoint yang membutuhkan autentikasi wajib menyertakan header:
```
Authorization: Bearer <access_token>
```

### Role & Hak Akses

| Role | Deskripsi |
|------|-----------|
| `superadmin` | Akses penuh ke seluruh sistem |
| `admin` | Akses data dan manajemen (tidak bisa hapus akun user) |
| `user` | Akses terbatas, hanya baca & input data |
| `viewer` | Hanya bisa melihat data tertentu (read-only) |

---

## Rate Limiting

| Batasan | Detail |
|---------|--------|
| Global | 500 request per IP per 15 menit |
| `/api/auth/login` | 500 percobaan per IP per 1 jam |

---

## Paginasi (Pagination)

Endpoint yang mengembalikan daftar data (list) mendukung parameter query paginasi:

| Parameter | Tipe | Default | Deskripsi |
|-----------|------|---------|-----------|
| `page` | integer | `1` | Nomor halaman yang ingin diambil |
| `limit` | integer | `20` | Jumlah baris data per halaman (maksimal 100) |

Jika `page` atau `limit` disertakan dalam request URL (contoh: `GET /api/admin/kk?page=1&limit=10`), respons akan berbentuk objek terpaginasi:
```json
{
  "data": [ ... ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

---

## 1. Autentikasi (`/api/auth`)

### POST `/api/auth/login`
Login dan mendapatkan access token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "token": "<access_token>",
  "refreshToken": "<refresh_token>",
  "user": { "id": 1, "username": "admin", "role": "superadmin" },
  "message": "Login berhasil"
}
```

**Response Error:**
```json
{ "success": false, "error": "Username atau password salah" }
```

---

### POST `/api/auth/refresh-token`
Memperbarui access token menggunakan refresh token.

**Request Body:**
```json
{
  "refreshToken": "<refresh_token>"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "token": "<new_access_token>",
  "user": { "id": 1, "username": "admin" }
}
```

**Response 401 (Token Kedaluwarsa):**
```json
{ "success": false, "error": "Sesi telah berakhir. Silakan login kembali." }
```

---

### POST `/api/auth/logout`
Menghapus refresh token dari database (logout).

**Request Body:**
```json
{
  "refreshToken": "<refresh_token>"
}
```

**Response 200 OK:**
```json
{ "success": true, "message": "Logout berhasil" }
```

---

### GET `/api/auth/me` (Perlu Login)
Mendapatkan data pengguna yang sedang login.

**Role:** Semua role yang sudah login.

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "superadmin"
  }
}
```

---

### POST `/api/auth/change-password` (Perlu Login)
Mengubah password pengguna yang sedang login.

**Role:** Semua role yang sudah login.

**Request Body:**
```json
{
  "currentPassword": "password_lama",
  "newPassword": "password_baru_min6"
}
```

**Response 200 OK:**
```json
{ "success": true, "message": "Password berhasil diubah. Silakan login kembali." }
```

---

## 2. Profil (`/api/profile`) (Perlu Login)

### GET `/api/profile`
Mendapatkan data profil pengguna yang sedang login.

**Role:** Semua role yang sudah login.

**Response 200 OK:**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "nama": "Administrator"
}
```

---

### PUT `/api/profile`
Memperbarui data profil pengguna yang sedang login.

**Role:** Semua role yang sudah login.

**Request Body (semua opsional):**
```json
{
  "nama": "Nama Baru",
  "email": "email_baru@example.com",
  "username": "username_baru"
}
```

**Response 200 OK:**
```json
{ "success": true, "message": "Profil berhasil diperbarui" }
```

---

## 3. Publik (`/api/public`) — Tanpa Autentikasi

Endpoint ini dapat diakses tanpa token (untuk landing page / publik).

### GET `/api/public/stats`
Mendapatkan statistik ringkasan untuk landing page.

**Query Parameter (opsional):**
| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `desa` | string | Filter berdasarkan nama desa/kelurahan |

**Contoh:** `GET /api/public/stats?desa=Wolo`

**Response 200 OK:**
```json
{
  "totalKK": 150,
  "totalAnggota": 600,
  "angkatanKerja": 300,
  "sudahBekerja": 200,
  "belumBekerja": 100
}
```

---

### GET `/api/public/villages`
Mendapatkan daftar desa/kelurahan yang tersedia di dalam database.

**Response 200 OK:**
```json
["Wolo", "Lapao-pao", "Tolowe Ponre Waru"]
```

---

### GET `/api/public/comparison`
Mendapatkan data perbandingan statistik antar desa.

**Response 200 OK:**
```json
[
  { "desa": "Wolo", "totalKK": 50, "angkatanKerja": 100 },
  { "desa": "Lapao-pao", "totalKK": 30, "angkatanKerja": 75 }
]
```

---

## 4. Kartu Keluarga / KK (`/api/kk`) (Perlu Login)

**Role Minimum:** `user`, `admin`, `superadmin`

### GET `/api/kk/members`
Mendapatkan semua data anggota keluarga.

**Response 200 OK:**
```json
[
  {
    "id": 1,
    "nik": "7401101234567890",
    "nama": "BUDI SANTOSO",
    "kk_id": 10,
    "nomor_kk": "7401100000000001",
    "jenis_kelamin": "L",
    "tanggal_lahir": "1990-01-01",
    "umur": 35,
    "pekerjaan": "WIRASWASTA"
  }
]
```

---

### POST `/api/kk/members`
Menambahkan anggota baru ke dalam KK.

**Request Body:**
```json
{
  "kk_id": 10,
  "nik": "7401101234567890",
  "nama": "BUDI SANTOSO",
  "jenis_kelamin": "L",
  "tanggal_lahir": "1990-01-15",
  "hubungan_keluarga": "ANAK",
  "pendidikan": "SLTA/SEDERAJAT",
  "pekerjaan": "WIRASWASTA",
  "status_domisili": "MENETAP"
}
```

**Response 200 OK:**
```json
{ "message": "Anggota keluarga berhasil ditambahkan", "id": 123 }
```

---

### PUT `/api/kk/members/:id`
Memperbarui data anggota keluarga berdasarkan ID.

**Path Parameter:** `id` — ID anggota (kk_members.id)

**Request Body:** Field yang akan diperbarui (sama dengan POST).

**Response 200 OK:**
```json
{ "message": "Data anggota berhasil diupdate" }
```

---

### DELETE `/api/kk/members/:id`
Menghapus anggota keluarga berdasarkan ID.

**Role:** Pemilik data, `admin`, atau `superadmin`.

**Response 200 OK:**
```json
{ "message": "Anggota berhasil dihapus" }
```

---

### POST `/api/kk/header`
Membuat header KK baru.

**Request:** `multipart/form-data`

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `nomor_kk` | string | Ya | 16 digit nomor KK |
| `kepala_keluarga` | string | Ya | Nama kepala keluarga |
| `alamat` | string | | Alamat lengkap |
| `desa` | string | | Nama desa/kelurahan |
| `kecamatan` | string | | Nama kecamatan |
| `kabupaten` | string | | Nama kabupaten |
| `provinsi` | string | | Nama provinsi |
| `zona_lingkar_tambang` | string | | Zona lingkar tambang |
| `foto_rumah` | file | | Foto rumah (upload) |

**Response 200 OK:**
```json
{ "message": "KK Header berhasil dibuat", "kk_id": 11 }
```

---

### PUT `/api/kk/header/:id`
Memperbarui header KK berdasarkan ID.

**Request:** `multipart/form-data` (field sama dengan POST, semua opsional)

**Response 200 OK:**
```json
{ "message": "KK Header berhasil diupdate" }
```

---

### DELETE `/api/kk/header/:id`
Menghapus header KK beserta anggotanya.

**Role:** `admin`, `superadmin`, atau pemilik data.

**Response 200 OK:**
```json
{ "message": "KK berhasil dihapus" }
```

---

### GET `/api/kk/:id`
Mendapatkan detail lengkap sebuah KK beserta anggota-anggotanya.

**Response 200 OK:**
```json
{
  "kk": { "id": 1, "nomor_kk": "7401100000000001", "kepala_keluarga": "BUDI" },
  "members": [
    { "id": 1, "nik": "7401101234567890", "nama": "BUDI" }
  ]
}
```

---

### POST `/api/kk/import/excel`
Import data KK, anggota, angkatan kerja, dan prasejahtera dari file Excel.

**Request:** `multipart/form-data`

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `file` | file(s) | File Excel (.xlsx/.xls), maksimal 10 file |

**Response 200 OK:**
```json
{
  "message": "Import selesai",
  "stats": {
    "kk": { "total": 50, "success": 48 },
    "members": { "total": 200, "success": 195 },
    "employment": { "total": 100, "success": 98 }
  },
  "errors": ["Row 5: NIK kosong"]
}
```

---

## 5. Admin (`/api/admin`) (Perlu Login)

### GET `/api/admin/stats`
Mendapatkan statistik dashboard admin.

**Role:** `superadmin`, `admin`, `user`

**Response 200 OK:**
```json
{
  "totalKK": 250,
  "totalAnggota": 1000,
  "angkatanKerja": 500,
  "sudahBekerja": 350,
  "belumBekerja": 150,
  "prasejahtera": 80
}
```

---

### GET `/api/admin/kk`
Mendapatkan semua data KK (tabel admin).

**Role:** `superadmin`, `admin`, `user`

**Response 200 OK:** Array objek KK lengkap dengan join data.

---

### GET `/api/admin/employment`
Mendapatkan semua data angkatan kerja.

**Role:** `superadmin`, `admin`, `user`

**Response 200 OK:** Array data angkatan kerja dengan info anggota KK.

---

### PUT `/api/admin/employment/full`
Memperbarui data angkatan kerja lengkap berdasarkan NIK.

**Role:** `superadmin`, `admin`, `user`

**Request Body:**
```json
{
  "nik": "7401101234567890",
  "status_kerja": "SUDAH BEKERJA",
  "skill_tags": "Pertanian, Perikanan",
  "tempat_bekerja": "PT. Contoh",
  "pendidikan_terakhir": "SLTA/SEDERAJAT",
  "no_hp_wa": "081234567890",
  "email": "contoh@email.com",
  "keterangan": "Keterangan tambahan"
}
```

**Response 200 OK:**
```json
{ "message": "Data berhasil diperbarui." }
```

---

### DELETE `/api/admin/employment/:id`
Menghapus data angkatan kerja berdasarkan ID.

**Role:** `superadmin` only

**Response 200 OK:**
```json
{ "message": "Data dihapus" }
```

---

### GET `/api/admin/kesejahteraan`
Mendapatkan semua data kesejahteraan/prasejahtera.

**Role:** `superadmin`, `admin`, `user`

**Response 200 OK:** Array data kesejahteraan dengan info KK.

---

### POST `/api/admin/kesejahteraan`
Membuat atau memperbarui data kesejahteraan.

**Role:** `superadmin`, `admin`, `user`

**Request Body:**
```json
{
  "kk_id": 1,
  "kategori_sosial": "PRASEJAHTERA",
  "kriteria": "Kriteria Tertentu",
  "tingkat_sosial": "RENDAH"
}
```

---

### PUT `/api/admin/kesejahteraan/:id`
Memperbarui data kesejahteraan berdasarkan ID.

**Role:** `superadmin`, `admin`, `user`

**Response 200 OK:**
```json
{ "message": "Data kesejahteraan berhasil diperbarui" }
```

---

### DELETE `/api/admin/kesejahteraan/:id`
Menghapus data kesejahteraan berdasarkan ID.

**Role:** `superadmin` only

**Response 200 OK:**
```json
{ "message": "Data dihapus" }
```

---

### GET `/api/admin/land`
Mendapatkan semua data lahan/tanah.

**Role:** `superadmin`, `admin`, `user`, `viewer`

**Response 200 OK:** Array data lahan beserta koordinat dan info KK.

---

### PUT `/api/admin/land/:id`
Memperbarui data lahan berdasarkan ID.

**Role:** `superadmin`, `admin`, `user`

**Request:** `multipart/form-data` (termasuk opsi upload `foto_rumah`)

**Response 200 OK:**
```json
{ "message": "Data berhasil diperbarui" }
```

---

### GET `/api/admin/users-with-kk`
Mendapatkan daftar KK untuk keperluan dropdown/referensi.

**Role:** `superadmin`, `admin`

**Response 200 OK:**
```json
[
  { "kk_id": 1, "nomor_kk": "7401100000000001", "kepala_keluarga": "BUDI", "alamat": "Jl. Contoh No. 1" }
]
```

---

### GET `/api/admin/users`
Mendapatkan daftar seluruh akun pengguna.

**Role:** `superadmin` only

**Response 200 OK:** Array data user (tanpa password).

---

### POST `/api/admin/users`
Membuat akun pengguna baru.

**Role:** `superadmin` only

**Request Body:**
```json
{
  "username": "user_baru",
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response 201 Created:**
```json
{ "message": "User dibuat", "id": 5 }
```

---

### PUT `/api/admin/users/:id`
Memperbarui data akun pengguna.

**Role:** `superadmin` only

**Request Body (semua opsional):**
```json
{
  "username": "username_baru",
  "email": "email_baru@example.com",
  "nama": "Nama Baru"
}
```

---

### PUT `/api/admin/users/:id/role`
Mengubah role akun pengguna.

**Role:** `superadmin` only

**Request Body:**
```json
{
  "role": "admin"
}
```

---

### PUT `/api/admin/users/:id/password`
Mereset/memperbarui password pengguna oleh superadmin.

**Role:** `superadmin` only

**Request Body:**
```json
{
  "password": "password_baru_min6"
}
```

---

### DELETE `/api/admin/users/:id`
Menghapus akun pengguna. Tidak bisa menghapus akun sendiri.

**Role:** `superadmin` only

**Response 200 OK:**
```json
{ "message": "User dihapus" }
```

---

## 6. Lahan (`/api/land`) (Perlu Login)

### GET `/api/land/foto/:filename`
Mengambil file foto rumah/lahan berdasarkan nama file. (Tidak butuh token)

**Contoh:** `GET /api/land/foto/rumah_123.jpg`

---

### GET `/api/land/search`
Mencari data KK berdasarkan nomor KK atau nama kepala keluarga.

**Role:** `superadmin`, `admin`, `user`, `viewer`

**Query Parameter:**
| Parameter | Tipe | Deskripsi |
|-----------|------|-----------|
| `q` | string | Kata kunci pencarian |

**Contoh:** `GET /api/land/search?q=BUDI`

---

### GET `/api/land/kk/:nomor_kk`
Mendapatkan data KK berdasarkan nomor KK.

**Role:** `superadmin`, `admin`, `user`, `viewer`

**Path Parameter:** `nomor_kk` — Nomor KK 16 digit

---

### GET `/api/land`
Mendapatkan semua data lahan/tanah beserta koordinat.

**Role:** `superadmin`, `admin`, `user`, `viewer`

---

### POST `/api/land`
Membuat data lahan/tanah baru.

**Role:** `superadmin`, `admin`, `user`

**Request:** `multipart/form-data`

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `kk_id` | integer | ID KK terkait |
| `lat` | float | Koordinat latitude |
| `lng` | float | Koordinat longitude |
| `luas_tanah` | float | Luas tanah (m2) |
| `foto_rumah` | file | Foto rumah/lahan |

---

### PUT `/api/land/:id`
Memperbarui data lahan berdasarkan ID.

**Role:** `superadmin`, `admin`, `user`

**Request:** `multipart/form-data` (field sama dengan POST, semua opsional)

---

### DELETE `/api/land/:id`
Menghapus data lahan berdasarkan ID.

**Role:** `superadmin`, `admin`

---

## 7. Statistik (`/api/statistics` atau `/api/stats`) (Perlu Login)

**Role:** Semua role yang sudah login.

### GET `/api/statistics/`
Mendapatkan statistik detail lengkap. (Sama dengan `/detailed`)

---

### GET `/api/statistics/dashboard`
Mendapatkan statistik ringkasan untuk dashboard.

**Response 200 OK:**
```json
{
  "totalKK": 250,
  "totalAnggota": 1000,
  "angkatanKerja": 500
}
```

---

### GET `/api/statistics/detailed`
Mendapatkan statistik detail lengkap termasuk breakdown per desa, per zona, dsb.

---

## 8. Zona (`/api/locations/zona`) (Perlu Login)

### GET `/api/locations/zona`
Mendapatkan semua data zona lingkar tambang.

**Role:** `superadmin`, `admin`, `user`, `viewer`

**Response 200 OK:**
```json
[
  { "id": 1, "nama_zona": "Ring 1", "keterangan": "Zona dalam" }
]
```

---

### POST `/api/locations/zona`
Membuat zona baru.

**Role:** `superadmin`, `admin`, `user`

**Request Body:**
```json
{
  "nama_zona": "Ring 2",
  "keterangan": "Zona menengah"
}
```

---

### PUT `/api/locations/zona/:id`
Memperbarui data zona berdasarkan ID.

**Role:** `superadmin`, `admin`, `user`

---

### DELETE `/api/locations/zona/:id`
Menghapus zona berdasarkan ID.

**Role:** `superadmin`, `admin`

---

## 9. Wilayah / Region (`/api/regions`) (Perlu Login)

Endpoint ini merupakan proxy ke API Wilayah Indonesia eksternal.

**Role:** Semua role yang sudah login.

### GET `/api/regions/provinces`
Mendapatkan daftar seluruh provinsi di Indonesia.

---

### GET `/api/regions/regencies/:provinceId`
Mendapatkan daftar kabupaten/kota berdasarkan ID provinsi.

**Contoh:** `GET /api/regions/regencies/74` (Sulawesi Tenggara)

---

### GET `/api/regions/districts/:regencyId`
Mendapatkan daftar kecamatan berdasarkan ID kabupaten.

---

### GET `/api/regions/villages/:districtId`
Mendapatkan daftar desa berdasarkan ID kecamatan.

---

## 10. Preview (`/api/preview`) (Perlu Login)

**Role:** `superadmin`, `admin`, `user`, `viewer`

### GET `/api/preview/kk`
Mendapatkan data KK dalam format preview/export (termasuk koordinat, jumlah anggota, data kesejahteraan, status angkatan kerja).

---

### GET `/api/preview/member`
Mendapatkan data anggota keluarga dalam format preview/export lengkap (NIK, umur, skill, status kerja, kontak, dll).

---

## 11. Log Aktivitas (`/api/logs`) (Perlu Login)

### GET `/api/logs`
Mendapatkan log aktivitas seluruh pengguna sistem.

**Role:** `superadmin` only

**Response 200 OK:**
```json
[
  {
    "id": 1,
    "user_id": 2,
    "username": "admin",
    "aksi": "CREATE_KK",
    "detail": "Membuat KK baru nomor 7401100000000001",
    "ip_address": "192.168.1.1",
    "created_at": "2026-07-16T06:00:00.000Z"
  }
]
```

---

## 12. Utilitas

### GET `/`
Mengecek apakah server berjalan.

**Response 200 OK:**
```json
{ "message": "Sistem Informasi Kependudukan Masyarakat Lingkar Tambang API" }
```

---

### GET `/api/ping`
Mengecek koneksi ke database.

**Response 200 OK:**
```json
{ "status": "ok", "message": "Database connected" }
```

**Response 500 (DB Error):**
```json
{ "error": "DB connection failed", "details": "..." }
```

---

## Format Error Standar

```json
{
  "success": false,
  "error": "Pesan error yang menjelaskan masalah"
}
```

| HTTP Status | Kondisi |
|-------------|---------|
| `400` | Data tidak valid / request salah |
| `401` | Tidak terautentikasi / token kedaluwarsa |
| `403` | Tidak memiliki hak akses |
| `404` | Data tidak ditemukan |
| `500` | Kesalahan internal server |
