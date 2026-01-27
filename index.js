const express = require('express');
const cors = require('cors');
const db = require('./config/database');
require("dotenv").config();
console.log("DB_USER =>", process.env.DB_USER);

// Import routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const documentRoutes = require('./routes/documentRoutes');
const landRoutes = require('./routes/landRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const regionRoutes = require('./routes/regionRoutes');
const publicRoutes = require('./routes/publicRoutes');
const userRoutes = require('./routes/userRoutes');
const previewRoutes = require('./routes/previewRoutes'); // Explicitly import previewRoutes

const app = express();

// Middleware
app.use(cors());
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
app.use('/api/documents', documentRoutes);
app.use('/api/land', landRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/announcements', announcementRoutes);
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
