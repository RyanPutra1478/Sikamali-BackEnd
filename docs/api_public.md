# Dokumentasi Public API (Landing Page)

API ini bersifat publik (tidak memerlukan autentikasi JWT) dan dirancang untuk digunakan pada halaman depan (Landing Page) aplikasi Sikamali.

## 1. Statistik Landing Page
Mengambil rangkuman data kependudukan dan kesejahteraan.

- **Endpoint**: `GET /api/public/stats`
- **Query Parameters**:
  - `desa` (Optional): Nama desa untuk memfilter data. Contoh: `/api/public/stats?desa=LAPAO-PAO`
- **Respons (JSON)**:
```json
{
    "totalKK": 150,
    "totalPenduduk": 450,
    "keluargaPrasejahtera": 40,
    "keluargaSejahtera": 110
}
```

## 2. Daftar Desa
Mengambil daftar semua desa yang ada di database untuk digunakan pada filter dropdown.

- **Endpoint**: `GET /api/public/villages`
- **Respons (JSON)**:
```json
["DESA A", "DESA B", "DESA C"]
```

---

## Contoh Penggunaan (JavaScript/Frontend)

### Fetch Stats
```javascript
const getStats = async (selectedDesa) => {
    const url = selectedDesa 
        ? `http://localhost:5000/api/public/stats?desa=${selectedDesa}`
        : 'http://localhost:5000/api/public/stats';
    
    const response = await fetch(url);
    const data = await response.json();
    console.log("Statistik:", data);
};
```

### Fetch Dropdown Desa
```javascript
const loadVillages = async () => {
    const response = await fetch('http://localhost:5000/api/public/villages');
    const villages = await response.json();
    // Gunakan villages untuk mengisi <select> atau combobox
};
```
