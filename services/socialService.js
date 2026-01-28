const { KesejahteraanModel } = require('../models/otherModels');
const KKModel = require('../models/kkModel');
const db = require('../config/database');
const logController = require('../controllers/logController');

const SocialService = {
    getKesejahteraanData: async (user) => {
        const userIdFilter = (user.role === 'superadmin' || user.role === 'admin' || user.role === 'user') ? null : user.id;
        return await KesejahteraanModel.getAllEnriched(userIdFilter, false);
    },

    upsertKesejahteraan: async (user, data, ip) => {
        const { kk_id, member_id, status_kesejahteraan } = data;

        if (!kk_id) throw new Error('KK ID wajib diisi');
        if (!member_id) throw new Error('Member ID wajib diisi');

        const existing = await KesejahteraanModel.getByKKId(kk_id);
        if (existing) {
            throw new Error('Data kesejahteraan untuk KK ini sudah terdaftar. Silakan hapus data sebelumnya terlebih dahulu jika ingin mengganti data.');
        }

        const currentStatus = status_kesejahteraan || 'sejahtera';
        const welfareData = {
            member_id,
            kk_id,
            income_per_month: data.income_per_month,
            house_condition: data.house_condition,
            access_listrik_air: data.access_listrik_air,
            status_kesejahteraan: currentStatus,
            tingkat_sosial: currentStatus.toLowerCase() === 'prasejahtera' ? data.tingkat_sosial : null,
            keterangan: data.keterangan,
            assessment_notes: data.assessment_notes,
            assessed_by: user.id
        };

        const insertId = await KesejahteraanModel.create(welfareData);
        await logController.createLog(user.id, 'CREATE', 'KESEJAHTERAAN', insertId, { member_id, status_kesejahteraan, kk_id }, ip);
        return { message: 'Data kesejahteraan KK berhasil disimpan' };
    },

    updateKesejahteraanRecord: async (user, id, data, ip) => {
        const existing = await KesejahteraanModel.getById(id);
        if (!existing) throw new Error('Data tidak ditemukan');

        const welfareData = {
            ...data,
            assessed_by: user.id
        };

        // Logic: if status is not prasejahtera, clear tingkat_sosial
        if (welfareData.status_kesejahteraan && welfareData.status_kesejahteraan.toLowerCase() !== 'prasejahtera') {
            welfareData.tingkat_sosial = null;
        }

        await KesejahteraanModel.update(id, welfareData);
        await logController.createLog(user.id, 'UPDATE', 'KESEJAHTERAAN', id, { member_id: welfareData.member_id, status_kesejahteraan: data.status_kesejahteraan }, ip);
        return true;
    },

    deleteKesejahteraan: async (userId, id, ip) => {
        const result = await KesejahteraanModel.delete(id);
        if (result === 0) throw new Error('Data tidak ditemukan');
        await logController.createLog(userId, 'DELETE', 'KESEJAHTERAAN', id, { id }, ip);
        return true;
    }
};

module.exports = SocialService;
