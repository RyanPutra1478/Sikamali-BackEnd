const multer = require('multer');
const path = require('path');
const fs = require('fs');

// PERBAIKAN DI SINI:
// Arahkan tujuan upload ke folder 'uploads/house_photos'
const uploadDir = path.join(__dirname, '../uploads/house_photos');

// Buat folder house_photos jika belum ada (Recursive true biar aman)
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Simpan di dalam house_photos
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// ... sisa kode filter dan export sama ...
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Hanya file gambar (jpeg, jpg, png, gif) yang diperbolehkan!');
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

module.exports = upload;