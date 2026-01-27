const xlsx = require('xlsx');
const db = require('../config/database');
const fs = require('fs');
const logController = require('../controllers/logController');

const ImportService = {
    parseDate: (val) => {
        if (!val) return null;
        if (typeof val === 'number') {
            try {
                const d = xlsx.SSF.parse_date_code(val);
                return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
            } catch (e) { return null; }
        }
        const d = new Date(val);
        return Number.isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
    },

    importExcel: async (userId, filePath, ip) => {
        const workbook = xlsx.readFile(filePath, { cellDates: true });
        const cleanKey = (key) => key ? String(key).trim().toUpperCase() : '';

        // Sheet 0: KK Headers
        const raw0 = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        const kkHeaders = {};
        raw0.forEach(row => {
            const c = {};
            Object.keys(row).forEach(k => { c[cleanKey(k)] = row[k]; });
            const noKK = c['NO KARTU KELUARGA'] ? String(c['NO KARTU KELUARGA']).trim() : null;
            if (!noKK) return;
            kkHeaders[noKK] = {
                nomor_kk: noKK,
                kepala_keluarga: c['NAMA KEPALA KELUARGA'],
                alamat: c['ALAMAT'],
                desa: c['DESA/ KELURAHAN'] || c['DESA'],
                kecamatan: c['KECAMATAN'],
                kabupaten: c['KABUPATEN/ KOTA'] || c['KABUPATEN/KOTA'],
                provinsi: c['PROPINSI'] || c['PROVINSI'],
                zona_lingkar: c['ZONA LINGKAR TAMBANG'],
                tanggal_diterbitkan: ImportService.parseDate(c['TANGGAL KK DITERBITKAN']),
                status_hard_copy: c['STATUS HARD COPY KK'],
                kategori_sosial: c['KATEGORI TINGKAT SOSIAL'],
                members: []
            };
        });

        // Sheet 1: Members
        const raw1 = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[1]]);
        raw1.forEach(row => {
            const c = {};
            Object.keys(row).forEach(k => { c[cleanKey(k)] = row[k]; });
            const noKK = c['NO KARTU KELUARGA'] ? String(c['NO KARTU KELUARGA']).trim() : null;
            if (!noKK || !kkHeaders[noKK]) return;
            kkHeaders[noKK].members.push({
                nama: c['NAMA ANGGOTA KELUARGA'] || c['NAMA'],
                nik: c['NIK'] ? String(c['NIK']).trim() : null,
                jenis_kelamin: c['JENIS KELAMIN'],
                tempat_lahir: c['TEMPAT LAHIR'],
                tanggal_lahir: c['TANGGAL LAHIR'],
                agama: c['AGAMA'],
                pendidikan: c['PENDIDIKAN'],
                pekerjaan: c['PEKERJAAN'] || c['STATUS KERJA'],
                status_perkawinan: c['STATUS PERKAWINAN'],
                tanggal_perkawinan: c['TANGGAL PERKAWINAN'],
                golongan_darah: c['GOLONGAN DARAH'] || c['GOL. DARAH'],
                hubungan_keluarga: c['HUBUNGAN DALAM KELUARGA'],
                status_domisili: c['STATUS DOMISILI'],
                kewarganegaraan: c['KEWARGANEGARAAN'],
                no_paspor: c['NO PASPORT'] || c['NO PASPOR'],
                no_kitap: c['NO KITAP'],
                nama_ayah: c['NAMA AYAH'],
                nama_ibu: c['NAMA IBU']
            });
        });

        // Sync to DB
        let successCount = 0;
        let errors = [];
        const kkList = Object.values(kkHeaders);

        for (const kk of kkList) {
            try {
                const [existing] = await db.query('SELECT id FROM kk WHERE nomor_kk = ?', [kk.nomor_kk]);
                let kkId;
                if (existing.length > 0) {
                    kkId = existing[0].id;
                    await db.query(`UPDATE kk SET kepala_keluarga=?, alamat=?, desa=?, kecamatan=?, kabupaten=?, provinsi=?, zona_lingkar_tambang=?, tanggal_diterbitkan=?, status_hard_copy=? WHERE id=?`,
                        [kk.kepala_keluarga, kk.alamat, kk.desa, kk.kecamatan, kk.kabupaten, kk.provinsi, kk.zona_lingkar, kk.tanggal_diterbitkan, kk.status_hard_copy, kkId]);
                } else {
                    const [kkRes] = await db.query(`INSERT INTO kk (nomor_kk, kepala_keluarga, alamat, desa, kecamatan, kabupaten, provinsi, zona_lingkar_tambang, tanggal_diterbitkan, status_hard_copy, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
                        [kk.nomor_kk, kk.kepala_keluarga, kk.alamat, kk.desa, kk.kecamatan, kk.kabupaten, kk.provinsi, kk.zona_lingkar, kk.tanggal_diterbitkan, kk.status_hard_copy, userId]);
                    kkId = kkRes.insertId;
                }

                // Sync Members
                await db.query('DELETE FROM kk_members WHERE kk_id = ?', [kkId]);
                for (const m of kk.members) {
                    await db.query(`INSERT INTO kk_members (kk_id, nama, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, status_perkawinan, pendidikan, pekerjaan, hubungan_keluarga, status_domisili, kewarganegaraan, no_kitap, nama_ayah, nama_ibu) 
                                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                        [kkId, m.nama, m.nik, m.jenis_kelamin, m.tempat_lahir, ImportService.parseDate(m.tanggal_lahir), m.agama, m.status_perkawinan, m.pendidikan, m.pekerjaan, m.hubungan_keluarga, m.status_domisili, m.kewarganegaraan || 'WNI', m.no_kitap, m.nama_ayah, m.nama_ibu]);
                }
                successCount++;
            } catch (err) {
                errors.push(`KK ${kk.nomor_kk}: ${err.message}`);
            }
        }

        // Sheet 3: Employment Data
        try {
            const sheet3Name = workbook.SheetNames.find(n => n.includes('3.') || n.toLowerCase().includes('angkatan kerja') || n.toLowerCase().includes('employment'));
            if (sheet3Name) {
                const raw3 = xlsx.utils.sheet_to_json(workbook.Sheets[sheet3Name]);

                for (const row of raw3) {
                    const c = {};
                    Object.keys(row).forEach(k => { c[cleanKey(k)] = row[k]; });
                    const nik = c['NIK'] ? String(c['NIK']).trim() : null;
                    if (!nik) continue;

                    const [member] = await db.query('SELECT id, kk_id FROM kk_members WHERE nik = ?', [nik]);
                    if (member.length > 0) {
                        const memberId = member[0].id;
                        const kkId = member[0].kk_id;

                        const empData = {
                            status_kerja: c['STATUS KERJA'],
                            skill_tags: c['SKILL'],
                            tempat_bekerja: c['TEMPAT BEKERJA'],
                            pendidikan_terakhir: c['PENDIDIKAN TERAKHIR'],
                            no_hp_wa: c['NO HP/WA'],
                            email: c['E-MAIL']
                        };

                        const [existing] = await db.query('SELECT id FROM employment_data WHERE member_id = ?', [memberId]);
                        if (existing.length > 0) {
                            await db.query('UPDATE employment_data SET status_kerja=?, skill_tags=?, tempat_bekerja=?, pendidikan_terakhir=?, no_hp_wa=?, email=? WHERE member_id=?',
                                [empData.status_kerja, empData.skill_tags, empData.tempat_bekerja, empData.pendidikan_terakhir, empData.no_hp_wa, empData.email, memberId]);
                        } else {
                            await db.query('INSERT INTO employment_data (kk_id, member_id, status_kerja, skill_tags, tempat_bekerja, pendidikan_terakhir, no_hp_wa, email) VALUES (?,?,?,?,?,?,?,?)',
                                [kkId, memberId, empData.status_kerja, empData.skill_tags, empData.tempat_bekerja, empData.pendidikan_terakhir, empData.no_hp_wa, empData.email]);
                        }
                    }
                }
            }
        } catch (err) {
            errors.push(`Employment Sheet Error: ${err.message}`);
        }

        // Sheet 4: Kesejahteraan
        try {
            const sheet4Name = workbook.SheetNames.find(n => n.includes('4.') || n.toLowerCase().includes('prasejahtera') || n.toLowerCase().includes('kesejahteraan'));
            if (sheet4Name) {
                const raw4 = xlsx.utils.sheet_to_json(workbook.Sheets[sheet4Name]);
                for (const row of raw4) {
                    const c = {};
                    Object.keys(row).forEach(k => { c[cleanKey(k)] = row[k]; });
                    const nik = c['NIK'] ? String(c['NIK']).trim() : null;
                    const welfareStatusRaw = c['KATEGORI SOSIAL'];
                    const tingkatSosial = c['TINGKAT SOSIAL'];

                    if (!nik) continue;

                    const [member] = await db.query('SELECT id, kk_id FROM kk_members WHERE nik = ?', [nik]);
                    if (member.length > 0) {
                        const memberId = member[0].id;
                        const kkId = member[0].kk_id;

                        let status = 'prasejahtera';
                        if (welfareStatusRaw) {
                            const lowerStatus = String(welfareStatusRaw).toLowerCase();
                            if (lowerStatus.includes('sejahtera mandiri')) status = 'sejahtera mandiri';
                            else if (lowerStatus.includes('pra sejahtera') || lowerStatus.includes('prasejahtera')) status = 'prasejahtera';
                            else if (lowerStatus.includes('sejahtera')) status = 'sejahtera';
                        }

                        const [existing] = await db.query('SELECT id FROM kesejahteraan WHERE member_id = ?', [memberId]);
                        if (existing.length > 0) {
                            await db.query('UPDATE kesejahteraan SET status_kesejahteraan = ?, tingkat_sosial = ?, kk_id = ? WHERE id = ?', [status, tingkatSosial, kkId, existing[0].id]);
                        } else {
                            await db.query('INSERT INTO kesejahteraan (member_id, kk_id, status_kesejahteraan, tingkat_sosial, assessed_by) VALUES (?, ?, ?, ?, ?)', [memberId, kkId, status, tingkatSosial, userId]);
                        }
                    }
                }
            }
        } catch (err) {
            errors.push(`Kesejahteraan Sheet Error: ${err.message}`);
        }

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        // Audit Log
        await logController.createLog(userId, 'IMPORT_EXCEL', 'SYSTEM', null, {
            total_kk: kkList.length,
            success: successCount,
            error_count: errors.length,
            file: filePath.split(/[\\/]/).pop()
        }, ip);

        return { total: kkList.length, success: successCount, errors };
    }
};

module.exports = ImportService;

