const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./config/database');
require("dotenv").config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const landRoutes = require('./routes/landRoutes');
const adminRoutes = require('./routes/adminRoutes');
const statisticRoutes = require('./routes/statisticRoutes');
const regionRoutes = require('./routes/regionRoutes');
const publicRoutes = require('./routes/publicRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 500, // Batas 500 request per IP per windowMs
  standardHeaders: true, // Kembalikan info rate limit di header `RateLimit-*`
  legacyHeaders: false, // Nonaktifkan header `X-RateLimit-*`
  message: {
    error: "Terlalu banyak permintaan dari IP ini, silakan coba lagi setelah 15 menit."
  }
});

// Terapkan ke semua rute
app.use(limiter);

// Spesifik rate limit untuk rute sensitive (opsional, contoh: auth)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 500, // Batas 500 percobaan login per jam
  message: {
    error: "Terlalu banyak percobaan login, silakan coba lagi setelah 1 jam."
  }
});
app.use('/api/auth/login', authLimiter);

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // 1. Allow mobile apps or curl (no origin)
    if (!origin) return callback(null, true);

    // 2. Check if origin is allowed
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('CORS Rejected for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Sistem Informasi Kependudukan Masyarakat Lingkar Tambang API' });
});

// Tes koneksi DB
app.get('/api/ping', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', message: 'Database connected' });
  } catch (err) {
    res.status(500).json({ error: 'DB connection failed', details: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/land', landRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/statistics', statisticRoutes);
app.use('/api/stats', statisticRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations/zona', require('./routes/zoneRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/kk', require('./routes/kkRoutes'));
app.use('/api/public', publicRoutes);
app.use('/api/preview', require('./routes/previewRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
