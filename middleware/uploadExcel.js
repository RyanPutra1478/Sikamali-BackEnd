const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Arahkan tujuan upload ke folder 'uploads/excel'
const uploadDir = path.join(__dirname, '../uploads/excel');

// Buat folder excel jika belum ada
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /xlsx|xls|csv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Mime types for excel can vary (application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv)
  // To be safe, just checking the extension is usually enough for this case
  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Hanya file Excel (xlsx, xls, csv) yang diperbolehkan!'));
  }
};

const uploadExcel = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit 10MB
  fileFilter: fileFilter
});

module.exports = uploadExcel;
