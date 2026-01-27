const KKModel = require('../models/kkModel');
const MemberModel = require('../models/memberModel');
const { LandPlotModel } = require('../models/otherModels');
const logController = require('../controllers/logController');
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const KKService = {
    createKK: async (userId, kkData, ip) => {
        const { lat, lng, latitude, longitude, foto_rumah, ...restData } = kkData;

        // Map FE names to internal names
        const finalLat = lat || latitude;
        const finalLng = lng || longitude;

        if (restData.tanggal_diterbitkan === '') restData.tanggal_diterbitkan = null;

        const kkId = await KKModel.create({
            ...restData,
            created_by: userId
        });

        // Create land plot if location data provided
        if (finalLat || finalLng || foto_rumah) {
            const lpId = await LandPlotModel.create({
                user_id: userId,
                kk_id: kkId,
                title: `Lokasi Rumah - ${restData.kepala_keluarga}`,
                lat: finalLat,
                lng: finalLng,
                foto_rumah
            });
        }

        await logController.createLog(userId, 'CREATE', 'KK', kkId, { nomor_kk: kkData.nomor_kk, kepala_keluarga: kkData.kepala_keluarga }, ip);
        return { kkId };
    },

    addMember: async (userId, memberData, ip) => {
        const kk = await KKModel.getById(memberData.kk_id);
        if (!kk) throw new Error('Data KK tidak ditemukan.');

        const existingMember = await MemberModel.getByNIK(memberData.nik);
        if (existingMember) throw new Error('NIK sudah terdaftar sebagai anggota keluarga lain.');

        const memberId = await MemberModel.create({
            ...memberData
        });

        await logController.createLog(userId, 'CREATE', 'MEMBER', memberId, { nik: memberData.nik, nama: memberData.nama, kk_id: memberData.kk_id }, ip);
        return memberId;
    },

    updateMember: async (userId, userRole, memberId, updateData, ip) => {
        const oldMember = await MemberModel.getById(memberId);
        if (!oldMember) throw new Error('Anggota tidak ditemukan.');

        const kk = await KKModel.getById(oldMember.kk_id);
        if (userRole === 'user' && kk.created_by !== userId) {
            throw new Error('Akses ditolak. Anda tidak memiliki izin untuk mengubah data ini.');
        }

        await MemberModel.update(memberId, updateData);
        await logController.createLog(userId, 'UPDATE', 'MEMBER', memberId, { old: oldMember, new: updateData }, ip);
        return true;
    },

    deleteMember: async (userId, userRole, memberId, ip) => {
        const member = await MemberModel.getById(memberId);
        if (!member) throw new Error('Anggota tidak ditemukan.');

        const kk = await KKModel.getById(member.kk_id);
        if (userRole === 'user' && kk.created_by !== userId) {
            throw new Error('Akses ditolak. Anda tidak memiliki izin untuk menghapus data ini.');
        }

        await MemberModel.delete(memberId);
        await logController.createLog(userId, 'DELETE', 'MEMBER', memberId, { nik: member.nik, nama: member.nama }, ip);
        return true;
    },

    getKKDetail: async (id) => {
        const kk = await KKModel.getById(id);
        if (!kk) throw new Error('KK tidak ditemukan');
        const members = await MemberModel.getByKKId(id);
        return { ...kk, members };
    },

    updateKK: async (userId, userRole, kkId, kkData, ip) => {
        const oldKK = await KKModel.getById(kkId);
        if (!oldKK) throw new Error('KK tidak ditemukan');

        if (userRole === 'user' && oldKK.created_by !== userId) {
            throw new Error('Akses ditolak. Anda tidak memiliki izin untuk mengubah data ini.');
        }

        console.log('Incoming KK Data:', kkData);

        const { lat, lng, latitude, longitude, foto_rumah, ...restData } = kkData;
        const finalLat = lat || latitude;
        const finalLng = lng || longitude;

        // Sanitize restData to only include valid columns for the kk table
        const validColumns = [
            'nomor_kk', 'kepala_keluarga', 'alamat', 'desa', 'kecamatan',
            'kabupaten', 'provinsi', 'zona_lingkar_tambang', 'tanggal_diterbitkan',
            'status_hard_copy', 'keterangan'
        ];

        const updateData = {};
        for (const col of validColumns) {
            if (restData.hasOwnProperty(col)) {
                updateData[col] = restData[col];
            }
        }

        // Map 'ring' to 'zona_lingkar_tambang' if 'zona_lingkar_tambang' is not present
        if (!updateData.zona_lingkar_tambang && kkData.ring) {
            updateData.zona_lingkar_tambang = kkData.ring;
        }

        if (updateData.tanggal_diterbitkan === '') updateData.tanggal_diterbitkan = null;

        // Update KK table
        await KKModel.update(kkId, updateData);

        // Handle Land Plot update/creation
        if (finalLat && finalLng) {
            console.log('Checking existing land plots for KK:', kkId);
            const [plots] = await db.query('SELECT id, foto_rumah as old_foto FROM land_plots WHERE kk_id = ? ORDER BY id DESC LIMIT 1', [kkId]);

            const landData = {
                lat: finalLat,
                lng: finalLng,
                title: `Lokasi Rumah - ${updateData.kepala_keluarga || oldKK.kepala_keluarga}`
            };

            if (foto_rumah) {
                landData.foto_rumah = foto_rumah;
            }

            if (plots.length > 0) {
                // Delete old photo if a new one is provided
                if (foto_rumah && plots[0].old_foto && plots[0].old_foto !== foto_rumah) {
                    const oldPath = path.join(__dirname, '../uploads/house_photos', plots[0].old_foto);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                        console.log('Old house photo deleted:', plots[0].old_foto);
                    }
                }

                console.log('Updating existing land plot:', plots[0].id, landData);
                await LandPlotModel.update(plots[0].id, landData);
                console.log('Land plot updated successfully');
            } else {
                console.log('No existing land plot found, creating new one for KK:', kkId);
                const lpId = await LandPlotModel.create({
                    user_id: userId,
                    kk_id: kkId,
                    ...landData
                });
                console.log('New land plot created during KK update, ID:', lpId);
            }
        } else {
            // If longlat is missing, delete existing land plot for this KK
            console.log('LongLat is empty, checking if land plot needs to be deleted for KK:', kkId);
            const [plots] = await db.query('SELECT id, foto_rumah FROM land_plots WHERE kk_id = ?', [kkId]);

            if (plots.length > 0) {
                for (const plot of plots) {
                    // Delete the photo file if it exists
                    if (plot.foto_rumah) {
                        const photoPath = path.join(__dirname, '../uploads/house_photos', plot.foto_rumah);
                        if (fs.existsSync(photoPath)) {
                            fs.unlinkSync(photoPath);
                            console.log('House photo deleted due to empty LongLat:', plot.foto_rumah);
                        }
                    }
                    // Delete the record
                    await LandPlotModel.delete(plot.id);
                    console.log('Land plot record deleted due to empty LongLat, ID:', plot.id);
                }
            }

            // Also delete the newly uploaded photo if any, since we don't allow photo without longlat
            if (foto_rumah) {
                const newPhotoPath = path.join(__dirname, '../uploads/house_photos', foto_rumah);
                if (fs.existsSync(newPhotoPath)) {
                    fs.unlinkSync(newPhotoPath);
                    console.log('Newly uploaded house photo deleted because LongLat is empty:', foto_rumah);
                }
            }
        }

        await logController.createLog(userId, 'UPDATE', 'KK', kkId, { old: oldKK, new: kkData }, ip);
        return true;
    },

    deleteKK: async (userId, userRole, kkId, ip) => {
        const kk = await KKModel.getById(kkId);
        if (!kk) throw new Error('KK tidak ditemukan');

        if (userRole === 'user' && kk.created_by !== userId) {
            throw new Error('Akses ditolak. Anda tidak memiliki izin untuk menghapus data ini.');
        }

        await KKModel.delete(kkId);
        await MemberModel.deleteByKKId(kkId);

        await logController.createLog(userId, 'DELETE', 'KK', kkId, { nomor_kk: kk.nomor_kk }, ip);
        return true;
    }
};

module.exports = KKService;

