const DocumentModel = require('../models/documentModel');
const KKModel = require('../models/kkModel');
const MemberModel = require('../models/memberModel');
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const DocumentService = {
    getAllDocuments: async (user) => {
        const userIdFilter = (user.role === 'superadmin' || user.role === 'admin' || user.role === 'user' || user.role === 'executive_guest') ? null : user.id;
        return await DocumentModel.getAllEnriched(userIdFilter);
    },

    getDocumentById: async (id) => {
        return await DocumentModel.getById(id);
    },

    uploadKK: async (userId, data, file) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const docId = await connection.query(
                'INSERT INTO documents (user_id, type, file_path) VALUES (?, ?, ?)',
                [userId, 'KK', file.filename]
            ).then(([res]) => res.insertId);

            const { nomor_kk, kepala_keluarga, alamat_kk, anggota_json } = data;
            const kkId = await connection.query(
                'INSERT INTO kk (document_id, nomor_kk, kepala_keluarga, alamat, created_by) VALUES (?, ?, ?, ?, ?)',
                [docId, nomor_kk || null, kepala_keluarga || null, alamat_kk || null, userId]
            ).then(([res]) => res.insertId);

            let members = [];
            try { members = JSON.parse(anggota_json || '[]'); } catch (e) { members = []; }

            for (const m of members) {
                await connection.query(
                    `INSERT INTO kk_members (document_id, kk_id, nama, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, status_perkawinan, pendidikan, pekerjaan, hubungan_keluarga, kewarganegaraan) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [docId, kkId, m.nama, m.nik, m.jenis_kelamin, m.tempat_lahir, m.tanggal_lahir, m.agama, m.status_perkawinan, m.pendidikan, m.pekerjaan, m.hubungan_keluarga, m.kewarganegaraan || 'WNI']
                );
            }

            await connection.commit();
            return { docId, kkId };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    },

    deleteDocument: async (id, user) => {
        const doc = await DocumentModel.getById(id);
        if (!doc) throw new Error('Dokumen tidak ditemukan');

        if (user.role !== 'admin' && doc.user_id !== user.id) throw new Error('Akses ditolak');

        if (doc.file_path && doc.file_path !== 'MANUAL_INPUT') {
            const filePath = path.join(__dirname, '../uploads', doc.file_path);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await MemberModel.deleteByDocId(id);
        await KKModel.deleteByDocId(id);
        await DocumentModel.delete(id);
        return true;
    }
};

module.exports = DocumentService;

