const { LandPlotModel } = require('../models/otherModels');
const KKModel = require('../models/kkModel');
const db = require('../config/database');
const path = require('path');
const fs = require('fs');
const logController = require('../controllers/logController');

const LandService = {
    getLandPlots: async (user) => {
        const userIdFilter = (user.role === 'superadmin' || user.role === 'admin' || user.role === 'user') ? null : user.id;
        return await LandPlotModel.getAllEnriched(userIdFilter);
    },

    createLandPlot: async (userId, data, file, ip) => {
        const { nomor_kk, lat, lng, cert_number, area_m2 } = data;
        const kk = await KKModel.getByNomor(nomor_kk);
        if (!kk) throw new Error('Nomor KK tidak ditemukan.');

        const fotoRumah = file ? file.filename : null;
        const title = `Rumah ${kk.kepala_keluarga || nomor_kk}`;

        const insertId = await LandPlotModel.create({
            user_id: userId,
            kk_id: kk.id,
            title,
            lat,
            lng,
            cert_number,
            area_m2,
            foto_rumah: fotoRumah
        });

        await logController.createLog(userId, 'CREATE', 'LAND_PLOT', insertId, { title, lat, lng, nomor_kk }, ip);

        return insertId;
    },

    updateLandPlot: async (id, userId, data, file, ip) => {
        const oldData = await LandPlotModel.getById(id);
        if (!oldData || oldData.user_id !== userId) throw new Error('Data tidak ditemukan atau Anda bukan pemiliknya');

        const updateData = { ...data };
        if (file) {
            updateData.foto_rumah = file.filename;
            if (oldData.foto_rumah) {
                const oldPath = path.join(__dirname, '../uploads/house_photos', oldData.foto_rumah);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }

        await LandPlotModel.update(id, updateData);
        await logController.createLog(userId, 'UPDATE', 'LAND_PLOT', id, { old: oldData, new: updateData }, ip);
        return true;
    },

    deleteLandPlot: async (id, userId, ip) => {
        const oldData = await LandPlotModel.getById(id);
        const result = await LandPlotModel.delete(id, userId);
        if (result === 0) throw new Error('Gagal menghapus (Akses ditolak/Data hilang)');

        await logController.createLog(userId, 'DELETE', 'LAND_PLOT', id, { title: oldData?.title }, ip);

        return true;
    }
};

module.exports = LandService;
