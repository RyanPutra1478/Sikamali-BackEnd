const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

const BASE_URL = process.env.WILAYAH_API_BASE_URL || 'https://emsifa.github.io/api-wilayah-indonesia/api';

async function proxyFetch(res, endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error('Gagal memuat data wilayah');
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Region proxy error:', err.message);
    res.status(500).json({ error: 'Gagal memuat data wilayah', details: err.message });
  }
}

router.use(authMiddleware);

router.get('/provinces', (req, res) => proxyFetch(res, '/provinces.json'));
router.get('/regencies/:provinceId', (req, res) =>
  proxyFetch(res, `/regencies/${req.params.provinceId}.json`)
);
router.get('/districts/:regencyId', (req, res) =>
  proxyFetch(res, `/districts/${req.params.regencyId}.json`)
);
router.get('/villages/:districtId', (req, res) =>
  proxyFetch(res, `/villages/${req.params.districtId}.json`)
);

module.exports = router;

