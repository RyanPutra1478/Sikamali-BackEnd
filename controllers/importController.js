const ImportService = require('../services/importService');

exports.importExcelKK = async (req, res) => {
  const files = req.files || (req.file ? [req.file] : []);

  if (files.length === 0) {
    return res.status(400).json({ error: 'File Excel tidak ditemukan.' });
  }

  try {
    let combinedStats = {
      kk: { total: 0, success: 0 },
      members: { total: 0, success: 0 },
      employment: { total: 0, success: 0 },
      welfare: { total: 0, success: 0 }
    };
    let combinedErrors = [];

    // Process each file sequentially
    for (const file of files) {
      try {
        const result = await ImportService.importExcel(req.user.id, file.path, req.ip);
        
        // Aggregate stats
        combinedStats.kk.total += result.stats.kk.total;
        combinedStats.kk.success += result.stats.kk.success;
        combinedStats.members.total += result.stats.members.total;
        combinedStats.members.success += result.stats.members.success;
        combinedStats.employment.total += result.stats.employment.total;
        combinedStats.employment.success += result.stats.employment.success;
        combinedStats.welfare.total += result.stats.welfare.total;
        combinedStats.welfare.success += result.stats.welfare.success;
        
        // Tag errors with file name
        const fileErrors = result.errors.map(err => `[${file.originalname}] ${err}`);
        combinedErrors = combinedErrors.concat(fileErrors);
      } catch (fileErr) {
        combinedErrors.push(`[${file.originalname}] Error Kritis: ${fileErr.message}`);
      }
    }

    res.json({
      message: 'Import selesai',
      stats: combinedStats,
      errors: combinedErrors
    });
  } catch (err) {
    console.error('Import Controller Error:', err);
    res.status(500).json({ error: 'Gagal memproses file Excel: ' + err.message });
  }
};

