const LandService = require('../services/landService');
const KKModel = require('../models/kkModel');

exports.createLandPlot = async (req, res) => {
  try {
    await LandService.createLandPlot(req.user.id, req.body, req.file, req.ip);
    res.json({ message: 'Lokasi tanah disimpan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLandPlots = async (req, res) => {
  try {
    const rows = await LandService.getLandPlots(req.user);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLandPlot = async (req, res) => {
  try {
    await LandService.updateLandPlot(req.params.id, req.user.id, req.body, req.file, req.ip);
    res.json({ message: 'Lokasi berhasil diperbarui' });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.deleteLandPlot = async (req, res) => {
  try {
    await LandService.deleteLandPlot(req.params.id, req.user.id, req.ip);
    res.json({ message: 'Lokasi dihapus' });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.getKKByNomor = async (req, res) => {
  try {
    const kk = await KKModel.getByNomor(req.params.nomor_kk);
    if (!kk) return res.status(404).json({ error: 'Data KK tidak ditemukan' });
    // Assuming we need members
    const MemberModel = require('../models/memberModel');
    const members = await MemberModel.getByKKId(kk.id);
    res.json({ ...kk, members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchKK = async (req, res) => {
  try {
    const rows = await KKModel.search(req.query.q);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLandPhoto = (req, res) => {
  const path = require('path');
  const fs = require('fs');
  const safeFilename = path.basename(req.params.filename);
  const filePath = path.join(__dirname, '../uploads/house_photos', safeFilename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Foto tidak ditemukan' });
  }
};
