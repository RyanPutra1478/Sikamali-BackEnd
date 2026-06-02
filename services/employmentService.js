const EmploymentModel = require('../models/employmentModel');
const MemberModel = require('../models/memberModel');
const KKModel = require('../models/kkModel');
const db = require('../config/database');
const logController = require('../controllers/logController');

const EmploymentService = {
    getEmploymentData: async (user) => {
        const userIdFilter = (user.role === 'superadmin' || user.role === 'admin' || user.role === 'user') ? null : user.id;
        return await EmploymentModel.getAllEnriched(userIdFilter);
    },

    upsertEmploymentFull: async (user, data, ip) => {
        const { nik } = data;
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Get member and KK info
            const [memberInfo] = await connection.query(`
                SELECT m.id as member_id, m.kk_id, k.created_by
                FROM kk_members m 
                JOIN kk k ON m.kk_id = k.id
                WHERE m.nik = ? LIMIT 1
            `, [nik]);

            if (memberInfo.length === 0) {
                throw new Error('NIK tidak ditemukan di data kependudukan.');
            }

            const { member_id, kk_id, created_by } = memberInfo[0];

            // Security Check
            if (user.role === 'user' && created_by !== user.id) {
                throw new Error('Anda tidak memiliki akses untuk mengubah data NIK ini.');
            }

            // 2. Upsert Employment Data
            const [existing] = await connection.query('SELECT id FROM employment_data WHERE member_id = ?', [member_id]);

            const employmentData = {
                kk_id,
                member_id,
                status_kerja: data.pekerjaan,
                skill_tags: data.skill_tags,
                tempat_bekerja: data.tempat_bekerja,
                experience_years: data.experience_years,
                availability: data.availability,
                preferred_roles: data.preferred_roles
            };

            const val = (v) => (v === '' || v === undefined || v === 'null' ? null : v);

            if (existing.length > 0) {
                await connection.query(
                    `UPDATE employment_data SET
                        kk_id = ?, member_id = ?, status_kerja = ?, skill_tags = ?, tempat_bekerja = ?, 
                        experience_years = ?, availability = ?, preferred_roles = ?
                    WHERE id = ?`,
                    [
                        employmentData.kk_id, employmentData.member_id, val(employmentData.status_kerja),
                        val(employmentData.skill_tags), val(employmentData.tempat_bekerja),
                        val(employmentData.experience_years), val(employmentData.availability),
                        val(employmentData.preferred_roles), existing[0].id
                    ]
                );
            } else {
                await connection.query(
                    `INSERT INTO employment_data(
                        kk_id, member_id, status_kerja, skill_tags, tempat_bekerja,
                        experience_years, availability, preferred_roles
                    ) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        employmentData.kk_id, employmentData.member_id, val(employmentData.status_kerja),
                        val(employmentData.skill_tags), val(employmentData.tempat_bekerja),
                        val(employmentData.experience_years), val(employmentData.availability),
                        val(employmentData.preferred_roles)
                    ]
                );
            }

            // 3. Update Member Data
            await connection.query(
                `UPDATE kk_members SET
                    nama = ?, jenis_kelamin = ?, tempat_lahir = ?, tanggal_lahir = ?,
                    agama = ?, status_perkawinan = ?, nama_ayah = ?, nama_ibu = ?,
                    nomor_paspor = ?, pendidikan = ?, pekerjaan = ?
                WHERE nik = ?`,
                [
                    val(data.nama), val(data.jenis_kelamin), val(data.tempat_lahir), val(data.tanggal_lahir),
                    val(data.agama), val(data.status_perkawinan), val(data.nama_ayah), val(data.nama_ibu),
                    val(data.no_passport), val(data.pendidikan), val(data.pekerjaan),
                    nik
                ]
            );

            await connection.commit();
            await logController.createLog(user.id, 'UPDATE', 'EMPLOYMENT', null, { nik, nama: data.nama, pekerjaan: data.pekerjaan }, ip);
            return true;
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    },

    deleteEmployment: async (userId, id, ip) => {
        const result = await EmploymentModel.delete(id);
        if (result === 0) throw new Error('Data tidak ditemukan');
        await logController.createLog(userId, 'DELETE', 'EMPLOYMENT', id, { id }, ip);
        return true;
    }
};

module.exports = EmploymentService;

