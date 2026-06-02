const xlsx = require('xlsx');
const db = require('../config/database');
const fs = require('fs');
const logController = require('../controllers/logController');
const ENUMS = require('../config/enums');

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

    safeEnum: (val, fallback = 'LAINNYA') => {
        if (!val) return fallback;
        let s = String(val).trim().toUpperCase();

        const aliasMap = {
            'DIPLOMA III': 'AKADEMI/ DIPLOMA III/ SARJANA MUDA',
            'D3': 'AKADEMI/ DIPLOMA III/ SARJANA MUDA',
            'AKADEMI': 'AKADEMI/ DIPLOMA III/ SARJANA MUDA',
            'SARJANA MUDA': 'AKADEMI/ DIPLOMA III/ SARJANA MUDA',
            'DIPLOMA IV': 'DIPLOMA IV/ STRATA 1',
            'STRATA 1': 'DIPLOMA IV/ STRATA 1',
            'S1': 'DIPLOMA IV/ STRATA 1',
            'SARJANA': 'DIPLOMA IV/ STRATA 1',
            'STRATA 2': 'MAGISTER/ STRATA 2',
            'S2': 'MAGISTER/ STRATA 2',
            'MAGISTER': 'MAGISTER/ STRATA 2',
            'STRATA 3': 'DOKTORAL/ STRATA 3',
            'S3': 'DOKTORAL/ STRATA 3',
            'DOKTORAL': 'DOKTORAL/ STRATA 3',
            'BELUM TAMAT SD': 'BELUM TAMAT SD/ SEDERAJAT',
            'TAMAT SD': 'TAMAT SD/ SEDERAJAT',
            'SD': 'TAMAT SD/ SEDERAJAT',
            'SLTP': 'SLTP/ SEDERAJAT',
            'SMP': 'SLTP/ SEDERAJAT',
            'SLTA': 'SLTA/ SEDERAJAT',
            'SMA': 'SLTA/ SEDERAJAT',
            'SMK': 'SLTA/ SEDERAJAT',
            'DIPLOMA I': 'DIPLOMA I/II',
            'DIPLOMA II': 'DIPLOMA I/II',
            'D1': 'DIPLOMA I/II',
            'D2': 'DIPLOMA I/II',
            'TIDAK SEKOLAH': 'TIDAK/ BELUM SEKOLAH',
            'BELUM SEKOLAH': 'TIDAK/ BELUM SEKOLAH',
            'TIDAK BEKERJA': 'BELUM/ TIDAK BEKERJA',
            'GURU TPQ': 'GURU TPQ',
            'SAUDARA': 'SAUDARA KANDUNG',
            'PENSIUNAN': 'PENSIUNAN PNS',
            'FARMASI': 'APOTEKER',
            'PPPK APOTEKER': 'APOTEKER',
            'PPPK PARUH WAKTU': 'PEGAWAI PPPK',
            'PENJAHIT': 'TUKANG JAHIT',
            'IMAM': 'IMAM MESJID',
            'PERAWAT': 'PARAMEDIK/ BIDAN/ PERAWAT',
            'PERBENGKELAN': 'WIRASWASTA',
            'PINDAH': 'BELUM/ TIDAK BEKERJA',
            'PURNAWIRAWAN TNI': 'PURNAWIRAWAN TNI/ POLRI'
        };

        if (aliasMap[s]) {
            return aliasMap[s];
        }

        // Fuzzy fallback for slashes just in case
        if (s.includes('DIPLOMA III')) return 'AKADEMI/ DIPLOMA III/ SARJANA MUDA';
        if (s.includes('STRATA 1')) return 'DIPLOMA IV/ STRATA 1';

        return s || fallback;
    },

    safeEnumWithLog: (val, validEnums, fieldName, errors, context, fallback = 'LAINNYA') => {
        let rawVal = val ? String(val).trim().toUpperCase() : null;
        let mappedValue = ImportService.safeEnum(val, fallback);

        if (!rawVal) return fallback;

        let isExactMatch = validEnums.includes(rawVal);
        let isMappedValid = validEnums.includes(mappedValue);

        if (isExactMatch) {
            return rawVal;
        }

        if (isMappedValid && rawVal !== mappedValue) {
            // Komentar: Jangan log penyesuaian kamus agar fokus ke duplikat
            // errors.push(`Sheet Anggota: Kolom ${fieldName} inputan "${rawVal}" untuk ${context.nama} (NIK: ${context.nik || 'Kosong'}) disesuaikan otomatis dari kamus menjadi "${mappedValue}".`);
            return mappedValue;
        }

        if (!isMappedValid) {
            // Komentar: Jangan log nilai fallback agar fokus ke duplikat
            // errors.push(`Sheet Anggota: Kolom ${fieldName} inputan "${rawVal}" untuk ${context.nama} (NIK: ${context.nik || 'Kosong'}) belum masuk daftar, otomatis diubah menjadi "${fallback}".`);
            return fallback;
        }

        return mappedValue;
    },

    getRowsFromSheet: (sheet, sheetName) => {
        const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        let headerRowIndex = -1;
        for (let i = 0; i <= 2; i++) {
            const row = rawData[i];
            if (row && row.length > 0) {
                const firstCell = String(row[0]).trim().toUpperCase();
                if (firstCell === 'NO' || firstCell.startsWith('NO ')) {
                    headerRowIndex = i;
                    break;
                }
            }
        }

        if (headerRowIndex === -1) {
            throw new Error(`Format tidak sesuai pada sheet ${sheetName || 'tersebut'}: Header tabel tidak ditemukan di baris pertama hingga ketiga (kolom pertama harus "NO" atau "NO KARTU KELUARGA").`);
        }

        return xlsx.utils.sheet_to_json(sheet, { range: headerRowIndex });
    },

    importExcel: async (userId, filePath, ip) => {
        const workbook = xlsx.readFile(filePath, { cellDates: true });
        const cleanKey = (key) => key ? String(key).trim().toUpperCase() : '';

        // Sheet KK Headers (Data Induk)
        const sheetKKName = workbook.SheetNames.find(n => n.toLowerCase().includes('induk') || n.includes('01')) || workbook.SheetNames[1];
        if (!sheetKKName) throw new Error("Sheet Data Induk tidak ditemukan.");
        const raw0 = ImportService.getRowsFromSheet(workbook.Sheets[sheetKKName], sheetKKName);
        const kkHeaders = {};
        let errors = [];
        raw0.forEach(row => {
            const c = {};
            Object.keys(row).forEach(k => { c[cleanKey(k)] = row[k]; });
            const noKK = c['NO KARTU KELUARGA'] ? String(c['NO KARTU KELUARGA']).trim() : null;
            if (!noKK) {
                // If the row has any data at all, log it
                if (Object.keys(c).length > 1) {
                    errors.push(`Sheet Data Induk: Baris dilewati karena NO KARTU KELUARGA kosong (Nama: ${c['NAMA KEPALA KELUARGA'] || 'Tanpa Nama'})`);
                }
                return;
            }
            if (kkHeaders[noKK]) {
                errors.push(`Sheet Data Induk: Ditemukan DUPLIKAT pada NO KARTU KELUARGA ${noKK}. Data KK sebelumnya ditimpa oleh data baris ini (Nama: ${c['NAMA KEPALA KELUARGA'] || 'Tanpa Nama'})`);
            }
            kkHeaders[noKK] = {
                nomor_kk: noKK,
                kepala_keluarga: c['NAMA KEPALA KELUARGA'],
                alamat: c['ALAMAT'],
                desa: c['DESA/ KELURAHAN'] || c['DESA'],
                kecamatan: c['KECAMATAN'],
                kabupaten: c['KABUPATEN/ KOTA'] || c['KABUPATEN/KOTA'],
                provinsi: c['PROPINSI'] || c['PROVINSI'],
                zona: c['ZONA LINGKAR TAMBANG'],
                tanggal_diterbitkan: ImportService.parseDate(c['TANGGAL KK DITERBITKAN']),
                status_hard_copy: c['STATUS HARD COPY KK'] || c['HARD COPY KK'],
                keterangan: c['KETERANGAN'],
                latitude: c['LATITUDE'],
                longitude: c['LONGITUDE'],
                members: []
            };
        });

        // Sheet Members (Anggota Keluarga)
        const sheetMembersName = workbook.SheetNames.find(n => n.toLowerCase().includes('anggota') || n.includes('02')) || workbook.SheetNames[2];
        if (sheetMembersName) {
            const raw1 = ImportService.getRowsFromSheet(workbook.Sheets[sheetMembersName], sheetMembersName);
            raw1.forEach(row => {
                const c = {};
                Object.keys(row).forEach(k => { c[cleanKey(k)] = row[k]; });
                const noKK = c['NO KARTU KELUARGA'] ? String(c['NO KARTU KELUARGA']).trim() : null;
                const namaAnggota = c['NAMA ANGGOTA KELUARGA'] || c['NAMA'] || 'Tanpa Nama';
                if (!noKK) {
                    if (namaAnggota !== 'Tanpa Nama' || c['NIK']) {
                        errors.push(`Sheet Anggota: Baris dilewati karena NO KARTU KELUARGA kosong (NIK: ${c['NIK'] || 'Kosong'}, Nama: ${namaAnggota})`);
                    }
                    return;
                }
                if (!kkHeaders[noKK]) {
                    errors.push(`Sheet Anggota: Baris dilewati karena NO KARTU KELUARGA ${noKK} tidak ditemukan di Sheet Data Induk (NIK: ${c['NIK'] || 'Kosong'}, Nama: ${namaAnggota})`);
                    return;
                }
                let ctx = { nama: namaAnggota, nik: c['NIK'] };
                kkHeaders[noKK].members.push({
                    nama: c['NAMA ANGGOTA KELUARGA'] || c['NAMA'],
                    nik: c['NIK'] ? String(c['NIK']).trim() : null,
                    jenis_kelamin: c['JENIS KELAMIN'],
                    tempat_lahir: c['TEMPAT LAHIR'],
                    tanggal_lahir: c['TANGGAL LAHIR'],
                    agama: c['AGAMA'],
                    pendidikan: ImportService.safeEnumWithLog(c['PENDIDIKAN'], ENUMS.PENDIDIKAN, 'Pendidikan', errors, ctx),
                    pekerjaan: (!c['PEKERJAAN'] && !c['STATUS KERJA']) ? 'BELUM/ TIDAK BEKERJA' : ImportService.safeEnumWithLog(c['PEKERJAAN'] || c['STATUS KERJA'], ENUMS.PEKERJAAN, 'Pekerjaan', errors, ctx, 'LAINNYA'),
                    status_perkawinan: ImportService.safeEnumWithLog(c['STATUS PERKAWINAN'], ENUMS.STATUS_PERKAWINAN, 'Status Perkawinan', errors, ctx),
                    tanggal_perkawinan: c['TANGGAL PERKAWINAN'],
                    golongan_darah: c['GOLONGAN DARAH'] || c['GOL. DARAH'],
                    hubungan_keluarga: ImportService.safeEnumWithLog(c['HUBUNGAN DALAM KELUARGA'], ENUMS.HUBUNGAN_KELUARGA, 'Hubungan Keluarga', errors, ctx),
                    status_domisili: ImportService.safeEnumWithLog(c['STATUS DOMISILI'], ENUMS.STATUS_DOMISILI, 'Status Domisili', errors, ctx),
                    kewarganegaraan: c['KEWARGANEGARAAN'],
                    no_paspor: c['NO PASPORT'] || c['NO PASPOR'],
                    no_kitap: c['NO KITAP'],
                    nama_ayah: c['NAMA AYAH'],
                    nama_ibu: c['NAMA IBU'],
                    status_kependudukan: ImportService.safeEnumWithLog(c['STATUS KEPENDUDUKAN'], ENUMS.STATUS_KEPENDUDUKAN, 'Status Kependudukan', errors, ctx, 'AKTIF'),
                    keterangan: c['KETERANGAN']
                });
            });
        }

        let stats = {
            kk: { total: 0, success: 0 },
            members: { total: 0, success: 0 },
            employment: { total: 0, success: 0 },
            welfare: { total: 0, success: 0 }
        };
        const kkList = Object.values(kkHeaders);

        stats.kk.total = kkList.length;
        kkList.forEach(kk => stats.members.total += kk.members.length);

        for (const kk of kkList) {
            try {
                const [existing] = await db.query('SELECT k.id, k.kepala_keluarga, k.desa, (SELECT nik FROM kk_members WHERE kk_id = k.id AND hubungan_keluarga LIKE "%KEPALA%" LIMIT 1) as nik FROM kk k WHERE k.nomor_kk = ?', [kk.nomor_kk]);
                let kkId;
                if (existing.length > 0) {
                    kkId = existing[0].id;
                    let newKepala = kk.members.find(m => String(m.hubungan_keluarga).toUpperCase().includes('KEPALA'));
                    let newNik = newKepala ? newKepala.nik : '-';
                    errors.push(`Info Duplikat KK: [DB -> No KK: ${kk.nomor_kk}, NIK Kepala: ${existing[0].nik || '-'}, Nama: ${existing[0].kepala_keluarga || '-'}, Desa: ${existing[0].desa || '-'}] DITIMPA OLEH [Excel -> No KK: ${kk.nomor_kk}, NIK Kepala: ${newNik}, Nama: ${kk.kepala_keluarga || '-'}, Desa: ${kk.desa || '-'}]`);
                    await db.query(`UPDATE kk SET kepala_keluarga=?, alamat=?, desa=?, kecamatan=?, kabupaten=?, provinsi=?, zona_lingkar_tambang=?, tanggal_diterbitkan=?, status_hard_copy=?, keterangan=? WHERE id=?`,
                        [kk.kepala_keluarga, kk.alamat, kk.desa, kk.kecamatan, kk.kabupaten, kk.provinsi, kk.zona, kk.tanggal_diterbitkan, kk.status_hard_copy, kk.keterangan, kkId]);
                } else {
                    const [kkRes] = await db.query(`INSERT INTO kk (nomor_kk, kepala_keluarga, alamat, desa, kecamatan, kabupaten, provinsi, zona_lingkar_tambang, tanggal_diterbitkan, status_hard_copy, keterangan, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
                        [kk.nomor_kk, kk.kepala_keluarga, kk.alamat, kk.desa, kk.kecamatan, kk.kabupaten, kk.provinsi, kk.zona, kk.tanggal_diterbitkan, kk.status_hard_copy, kk.keterangan, userId]);
                    kkId = kkRes.insertId;
                }

                // Sync Land Plot for Latitude/Longitude
                if (kk.latitude || kk.longitude) {
                    const [existingPlot] = await db.query('SELECT id FROM land_plots WHERE kk_id = ?', [kkId]);
                    if (existingPlot.length > 0) {
                        await db.query('UPDATE land_plots SET lat=?, lng=? WHERE id=?', [kk.latitude || null, kk.longitude || null, existingPlot[0].id]);
                    } else {
                        await db.query('INSERT INTO land_plots (user_id, kk_id, lat, lng, title) VALUES (?, ?, ?, ?, ?)', [userId, kkId, kk.latitude || null, kk.longitude || null, 'Rumah Utama']);
                    }
                }

                // Sync Members
                await db.query('DELETE FROM kk_members WHERE kk_id = ?', [kkId]);
                for (const m of kk.members) {
                    try {
                        await db.query(`INSERT INTO kk_members (kk_id, nama, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, status_perkawinan, pendidikan, pekerjaan, hubungan_keluarga, status_domisili, status_kependudukan, kewarganegaraan, no_kitap, nama_ayah, nama_ibu, keterangan) 
                                         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                            [kkId, m.nama, m.nik, m.jenis_kelamin, m.tempat_lahir, ImportService.parseDate(m.tanggal_lahir), m.agama, m.status_perkawinan, m.pendidikan, m.pekerjaan, m.hubungan_keluarga, m.status_domisili, m.status_kependudukan, m.kewarganegaraan || 'WNI', m.no_kitap, m.nama_ayah, m.nama_ibu, m.keterangan || null]);
                        stats.members.success++;
                    } catch (err) {
                        errors.push(`Sheet Anggota Error [NIK: ${m.nik || 'Kosong'}, Nama: ${m.nama}]: ${err.message}`);
                    }
                }
                stats.kk.success++;
            } catch (err) {
                errors.push(`KK ${kk.nomor_kk}: ${err.message}`);
            }
        }

        // Sheet Employment Data
        try {
            const sheet3Name = workbook.SheetNames.find(n => n.toLowerCase().includes('angkatan kerja') || n.includes('03')) || workbook.SheetNames[3];
            if (sheet3Name) {
                const raw3 = ImportService.getRowsFromSheet(workbook.Sheets[sheet3Name], sheet3Name);

                for (const row of raw3) {
                    const c = {};
                    Object.keys(row).forEach(k => { c[cleanKey(k)] = row[k]; });
                    const nik = c['NIK'] ? String(c['NIK']).trim() : null;
                    if (!nik) {
                        if (c['NAMA ANGGOTA KELUARGA'] || c['NAMA'] || c['STATUS KERJA']) {
                            errors.push(`Sheet Angkatan Kerja: Baris dilewati karena NIK kosong.`);
                        }
                        continue;
                    }
                    stats.employment.total++;

                    try {
                        const [member] = await db.query('SELECT m.id, m.kk_id, m.nama, m.nik, k.desa, k.nomor_kk FROM kk_members m JOIN kk k ON m.kk_id = k.id WHERE m.nik = ?', [nik]);
                        if (member.length > 0) {
                            const memberId = member[0].id;
                            const kkId = member[0].kk_id;

                            let statKerja = String(c['STATUS KERJA'] || '').toUpperCase();
                            let parsedStatusKerja = 'BELUM BEKERJA';
                            if (statKerja && !statKerja.includes('BELUM') && !statKerja.includes('TIDAK')) {
                                parsedStatusKerja = 'SUDAH BEKERJA';
                            }

                            const empData = {
                                status_kerja: parsedStatusKerja,
                                skill_tags: c['SKILL'],
                                tempat_bekerja: c['TEMPAT BEKERJA'],
                                pendidikan_terakhir: ImportService.safeEnum(c['PENDIDIKAN TERAKHIR']),
                                no_hp_wa: c['NO HP/WA'],
                                email: c['E-MAIL'],
                                keterangan: c['KETERANGAN']
                            };

                            const [existing] = await db.query('SELECT id FROM employment_data WHERE member_id = ?', [memberId]);
                            if (existing.length > 0) {
                                let exNama = c['NAMA ANGGOTA KELUARGA'] || c['NAMA'] || '-';
                                errors.push(`Info Duplikat Angkatan Kerja: [DB -> No KK: ${member[0].nomor_kk || '-'}, NIK: ${member[0].nik || '-'}, Nama: ${member[0].nama || '-'}, Desa: ${member[0].desa || '-'}] DIPERBARUI OLEH [Excel -> NIK: ${nik}, Nama: ${exNama}]`);
                                await db.query('UPDATE employment_data SET status_kerja=?, skill_tags=?, tempat_bekerja=?, pendidikan_terakhir=?, no_hp_wa=?, email=?, keterangan=? WHERE member_id=?',
                                    [empData.status_kerja, empData.skill_tags, empData.tempat_bekerja, empData.pendidikan_terakhir, empData.no_hp_wa, empData.email, empData.keterangan, memberId]);
                            } else {
                                await db.query('INSERT INTO employment_data (kk_id, member_id, status_kerja, skill_tags, tempat_bekerja, pendidikan_terakhir, no_hp_wa, email, keterangan) VALUES (?,?,?,?,?,?,?,?,?)',
                                    [kkId, memberId, empData.status_kerja, empData.skill_tags, empData.tempat_bekerja, empData.pendidikan_terakhir, empData.no_hp_wa, empData.email, empData.keterangan]);
                            }
                            stats.employment.success++;
                        }
                    } catch (err) {
                        errors.push(`Employment NIK ${nik}: ${err.message}`);
                    }
                }
            }
        } catch (err) {
            errors.push(`Employment Sheet Error: ${err.message}`);
        }

        // Sheet Kesejahteraan
        try {
            const sheet4Name = workbook.SheetNames.find(n => n.toLowerCase().includes('pra sejahtera') || n.toLowerCase().includes('prasejahtera') || n.includes('04')) || workbook.SheetNames[4];
            if (sheet4Name) {
                const raw4 = ImportService.getRowsFromSheet(workbook.Sheets[sheet4Name], sheet4Name);
                for (const row of raw4) {
                    const c = {};
                    Object.keys(row).forEach(k => { c[cleanKey(k)] = row[k]; });
                    const nik = c['NIK'] ? String(c['NIK']).trim() : null;
                    const tingkatSosial = c['TINGKAT SOSIAL'];
                    const kriteria = c['KRITERIA'];
                    const kategoriSosial = c['KATEGORI SOSIAL'];
                    const keterangan = c['KETERANGAN'];

                    if (!nik) {
                        if (c['NAMA ANGGOTA KELUARGA'] || c['NAMA'] || c['KATEGORI SOSIAL']) {
                            errors.push(`Sheet Pra Sejahtera: Baris dilewati karena NIK kosong.`);
                        }
                        continue;
                    }
                    stats.welfare.total++;

                    try {
                        const [member] = await db.query('SELECT m.id, m.kk_id, m.nama, m.nik, k.desa, k.nomor_kk FROM kk_members m JOIN kk k ON m.kk_id = k.id WHERE m.nik = ?', [nik]);
                        if (member.length > 0) {
                            const memberId = member[0].id;
                            const kkId = member[0].kk_id;

                            const [existing] = await db.query('SELECT id FROM kesejahteraan WHERE member_id = ?', [memberId]);
                            if (existing.length > 0) {
                                let exNama = c['NAMA ANGGOTA KELUARGA'] || c['NAMA'] || '-';
                                errors.push(`Info Duplikat Pra Sejahtera: [DB -> No KK: ${member[0].nomor_kk || '-'}, NIK: ${member[0].nik || '-'}, Nama: ${member[0].nama || '-'}, Desa: ${member[0].desa || '-'}] DIPERBARUI OLEH [Excel -> NIK: ${nik}, Nama: ${exNama}]`);
                                await db.query('UPDATE kesejahteraan SET tingkat_sosial = ?, kriteria = ?, kategori_sosial = ?, keterangan = ?, kk_id = ? WHERE id = ?', [tingkatSosial, kriteria, kategoriSosial, keterangan, kkId, existing[0].id]);
                            } else {
                                await db.query('INSERT INTO kesejahteraan (member_id, kk_id, tingkat_sosial, kriteria, kategori_sosial, keterangan, assessed_by) VALUES (?, ?, ?, ?, ?, ?, ?)', [memberId, kkId, tingkatSosial, kriteria, kategoriSosial, keterangan, userId]);
                            }
                            stats.welfare.success++;
                        }
                    } catch (err) {
                        errors.push(`Welfare NIK ${nik}: ${err.message}`);
                    }
                }
            }
        } catch (err) {
            errors.push(`Kesejahteraan Sheet Error: ${err.message}`);
        }

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        // Audit Log
        await logController.createLog(userId, 'IMPORT_EXCEL', 'SYSTEM', null, {
            stats: stats,
            error_count: errors.length,
            file: filePath.split(/[\\/]/).pop()
        }, ip);

        return { stats, errors };
    }
};

module.exports = ImportService;

