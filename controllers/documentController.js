const DocumentService = require('../services/documentService');
const KKService = require('../services/kkService');
const SocialService = require('../services/socialService');
const EmploymentService = require('../services/employmentService');
const KKModel = require('../models/kkModel');
const MemberModel = require('../models/memberModel');
const db = require('../config/database');
const path = require('path');

// 1. Upload & Basic Management
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File tidak ditemukan' });
    const result = await DocumentService.uploadKK(req.user.id, req.body, req.file);
    res.json({
      message: 'Upload berhasil',
      file_path: req.file.filename,
      document_id: result.docId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const docs = await DocumentService.getAllDocuments(req.user);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.adminListDocuments = exports.getDocuments;

exports.deleteDocument = async (req, res) => {
  try {
    await DocumentService.deleteDocument(req.params.id, req.user);
    res.json({ message: 'Dokumen berhasil dihapus' });
  } catch (err) {
    res.status(err.message === 'Akses ditolak' ? 403 : 500).json({ error: err.message });
  }
};

exports.getDocumentFile = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Manual Input & Bridge Methods
exports.createKKManual = async (req, res) => {
  try {
    const { kkId, docId } = await KKService.createKK(req.user.id, req.body, req.ip);
    res.json({ message: 'Data KK tersimpan', document_id: docId, kk_id: kkId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    // Note: Document update usually means updating the KK associated with it
    const [kk] = await db.query('SELECT id FROM kk WHERE document_id = ?', [req.params.id]);
    if (kk.length === 0) throw new Error('KK tidak ditemukan untuk dokumen ini');
    await KKService.updateKK(req.user.id, req.user.role, kk[0].id, req.body, req.ip);
    res.json({ message: 'Data KK berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.copyDocument = async (req, res) => {
  res.status(501).json({ error: 'Fungsi copy belum diimplementasi di arsitektur baru.' });
};

// 3. Social & Employment Bridges (Pindahan)
exports.searchKKByNomor = async (req, res) => {
  try {
    const { nomor_kk } = req.query;
    const kk = await KKModel.getByNomor(nomor_kk);
    if (!kk) return res.status(404).json({ error: 'Data KK tidak ditemukan' });
    const members = await MemberModel.getByKKId(kk.id);
    // Add kesejahteraan info
    const { KesejahteraanModel } = require('../models/otherModels');
    const kes = await KesejahteraanModel.getByKKId(kk.id);
    res.json({ ...kk, members, ...kes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrUpdateKesejahteraan = async (req, res) => {
  try {
    const result = await SocialService.upsertKesejahteraan(req.user, req.body, req.ip);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listUserKesejahteraan = async (req, res) => {
  try {
    const data = await SocialService.getKesejahteraanData(req.user);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchEmploymentByNIK = async (req, res) => {
  try {
    const { nik } = req.query;
    const [member] = await db.query('SELECT * FROM kk_members WHERE nik = ?', [nik]);
    if (member.length === 0) return res.status(404).json({ error: 'NIK tidak ditemukan.' });

    const [emp] = await db.query('SELECT * FROM employment_data WHERE member_id = ?', [member[0].id]);
    const [kk] = await db.query('SELECT * FROM kk WHERE id = ?', [member[0].kk_id]);

    res.json({
      ...member[0],
      ...emp[0],
      nomor_kk: kk[0]?.nomor_kk,
      kepala_keluarga: kk[0]?.kepala_keluarga,
      alamat: kk[0]?.alamat,
      zona: kk[0]?.zona_lingkar_tambang
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEmploymentData = async (req, res) => {
  try {
    await EmploymentService.upsertEmploymentFull(req.user, req.body, req.ip);
    res.json({ message: 'Data ketenagakerjaan berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listUserEmployment = async (req, res) => {
  try {
    const data = await EmploymentService.getEmploymentData(req.user);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUserEmployment = async (req, res) => {
  try {
    await EmploymentService.deleteEmployment(req.user.id, req.params.id, req.ip);
    res.json({ message: 'Data dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

