const ImportService = require('../services/importService');

exports.importExcelKK = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File Excel tidak ditemukan.' });
  try {
    const result = await ImportService.importExcel(req.user.id, req.file.path, req.ip);
    res.json({
      message: 'Import selesai',
      total_processed: result.total,
      success_count: result.success,
      errors: result.errors
    });
  } catch (err) {
    console.error('Import Controller Error:', err);
    res.status(500).json({ error: 'Gagal memproses file Excel: ' + err.message });
  }
};

