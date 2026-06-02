const xlsx = require('xlsx');
const ExcelJS = require('exceljs');
const path = require('path');

async function generateReport() {
    const workbook = new ExcelJS.Workbook();

    // =============================================
    // SHEET 1: Duplikat KK
    // =============================================
    const sheetKK = workbook.addWorksheet('Duplikat KK');

    // Merge header group
    sheetKK.mergeCells('A1:B1');
    sheetKK.getCell('A1').value = 'IDENTITAS';
    sheetKK.mergeCells('C1:F1');
    sheetKK.getCell('C1').value = '📂 DATA SEBELUMNYA (Database)';
    sheetKK.mergeCells('G1:J1');
    sheetKK.getCell('G1').value = '📥 DATA BARU DARI EXCEL (Menimpa)';

    const headerStyle = (color) => ({
        font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: color } },
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    });

    ['A1', 'B1'].forEach(c => Object.assign(sheetKK.getCell(c), headerStyle('FF1565C0')));
    ['C1', 'D1', 'E1', 'F1'].forEach(c => Object.assign(sheetKK.getCell(c), headerStyle('FF2E7D32')));
    ['G1', 'H1', 'I1', 'J1'].forEach(c => Object.assign(sheetKK.getCell(c), headerStyle('FFC62828')));

    // Sub headers row 2
    sheetKK.getRow(2).values = [
        'No', 'Sumber File Excel',
        'No KK (DB)', 'NIK Kepala (DB)', 'Nama Kepala (DB)', 'Desa (DB)',
        'No KK (Excel)', 'NIK Kepala (Excel)', 'Nama Kepala (Excel)', 'Desa (Excel)'
    ];
    sheetKK.getRow(2).eachCell(cell => {
        cell.font = { bold: true, size: 10 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = { top: { style: 'thin' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
    });
    sheetKK.getRow(2).height = 30;

    const kkData = [
        ['Samaenre', '7401100301120027','7401100202740001','RABA','LAPAO-PAO', '7401100301120027','7401100202740001','RABA','SAMAENRE'],
        ['Samaenre', '7401101811110001','7401103006710001','USMAN','TOLOWE PONRE WARU', '7401101811110001','7401102003720002','AMBO HAKIM','SAMAENRE'],
        ['Samaenre', '7401101204120006','7401102002800005','BURHANG','LAPAO-PAO', '7401101204120006','7401102002800005','BURHANG','SAMAENRE'],
        ['Samaenre', '7401100212110006','7401105003850001','RAJEMANG','LAPAO-PAO', '7401100212110006','7401102012740003','MUSTAFAH','SAMAENRE'],
        ['Samaenre', '7401102309160001','7302082510680001','SUHARDI','TOLOWE PONRE WARU', '7401102309160001','7302062510680001','SUHARDI','SAMAENRE'],
        ['Ulu Wolo', '7401100605080003','7401102405980001','HADHY','LAPAO-PAO', '7401100605080003','7401104107730042','NUDDIN SUNGE','ULU WOLO'],
        ['Ulu Wolo', '7401102610100001','7401100204750004','SAFRI','MUARA LAPAO-PAO', '7401102610100001','7401100107830007','MUHARDIN SYAHRUDDIN','ULU WOLO'],
        ['Ulu Wolo', '7401102004100001','7401102004100001','HAMARUDDIN','TOLOWE PONRE WARU', '7401102004100001','7401102501710001','HAMARUDDIN','ULU WOLO'],
        ['Ulu Wolo', '7401101407110001','7401101011740001','MARSUDI','TOLOWE PONRE WARU', '7401101407110001','7401103012770002','HAMSAH','ULU WOLO'],
        ['Ulu Wolo', '7401102107210001','7401100607980003','ILHAM','LAPAO-PAO', '7401102107210001','7401100607980003','ILHAM','ULU WOLO'],
        ['Ulu Wolo', '7401201811210002','7401202304020002','SUKIRMAN','SAMAENRE', '7401201811210002','7401202304020002','SUKIRMAN','ULU WOLO'],
        ['Wolo', '7401100209150001','7304102707810002','SULTAN','ULU WOLO', '7401100209150001','7401100102440003','MANDU','WOLO'],
        ['Wolo', '7401103006100006','7401101809750002','HERMAWIS','ULU WOLO', '7401103006100006','7401101809750002','HERMAWIS','WOLO'],
        ['Wolo', '7401100605080003','7401104107730042','NUDDIN SUNGE','ULU WOLO', '7401100605080003','7401100305710001','AKHSAN TAQWIM','WOLO'],
        ['Wolo', '7401102906120001','7401105202530001','MARUMING','TOLOWE PONRE WARU', '7401102906120001','7401101506890003','HAKIMUDDIN','WOLO'],
    ];

    kkData.forEach((row, i) => {
        const r = sheetKK.addRow([i + 1, ...row]);
        const isOdd = i % 2 === 0;
        r.eachCell((cell, colNum) => {
            cell.alignment = { vertical: 'middle', horizontal: colNum <= 2 ? 'center' : 'left', wrapText: true };
            cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            if (colNum >= 3 && colNum <= 6) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isOdd ? 'FFE8F5E9' : 'FFC8E6C9' } };
            } else if (colNum >= 7) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isOdd ? 'FFFCE4EC' : 'FFF8BBD9' } };
            } else {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isOdd ? 'FFFE9DEF' : 'FFE8EAF6' } };
            }
        });
        r.height = 22;
        // Highlight differences
        const pairs = [[4, 8], [5, 9], [6, 10]]; // NIK, Nama, Desa
        pairs.forEach(([dbCol, exCol]) => {
            if (r.getCell(dbCol).value !== r.getCell(exCol).value) {
                r.getCell(dbCol).font = { bold: true, color: { argb: 'FF8B0000' } };
                r.getCell(exCol).font = { bold: true, color: { argb: 'FF1A237E' } };
            }
        });
    });

    sheetKK.columns = [
        { width: 5 }, { width: 18 },
        { width: 20 }, { width: 20 }, { width: 22 }, { width: 20 },
        { width: 20 }, { width: 20 }, { width: 22 }, { width: 20 }
    ];
    sheetKK.getRow(1).height = 28;

    // =============================================
    // SHEET 2: Duplikat Angkatan Kerja
    // =============================================
    const sheetAK = workbook.addWorksheet('Duplikat Angkatan Kerja');

    sheetAK.mergeCells('A1:C1');
    sheetAK.getCell('A1').value = 'IDENTITAS';
    sheetAK.mergeCells('D1:E1');
    sheetAK.getCell('D1').value = '📂 DATA SEBELUMNYA (Database)';
    sheetAK.mergeCells('F1:F1');
    sheetAK.getCell('F1').value = '📥 DATA BARU DARI EXCEL (Menimpa)';

    ['A1','B1','C1'].forEach(c => Object.assign(sheetAK.getCell(c), headerStyle('FF1565C0')));
    ['D1','E1'].forEach(c => Object.assign(sheetAK.getCell(c), headerStyle('FF2E7D32')));
    ['F1'].forEach(c => Object.assign(sheetAK.getCell(c), headerStyle('FFC62828')));

    sheetAK.getRow(2).values = ['No', 'Sumber File Excel', 'No KK', 'NIK Pekerja (DB)', 'Nama (DB)', 'Desa (DB)', 'Nama di Excel'];
    sheetAK.getRow(2).eachCell(cell => {
        cell.font = { bold: true, size: 10 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = { top: { style: 'thin' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
    });
    sheetAK.getRow(2).height = 30;

    const akData = [
        ['Ponre', '7401100304120025', '7401106904030001', 'ARNIANTI', 'LAPAO-PAO', 'FAJRY ANNUR'],
        ['Samaenre', '7401103112130004', '7401106407970001', 'DEVI EVRIDA YANTI', 'TOLOWE PONRE WARU', 'KHUSNUL KHATIMA'],
        ['Ulu Wolo', '7401101704120004', '7401101204890002', 'HENDRA', 'TOLOWE PONRE WARU', 'LELI'],
        ['Ulu Wolo', '7401101001120001', '7401100505750003', 'RUSLI', 'LAPAO-PAO', 'OBINK. B MASRY'],
        ['Ulu Wolo', '7401102812230001', '7401100504920005', 'NASRUL', 'TOLOWE PONRE WARU', 'NASRUL'],
        ['Wolo', '7401101210100002', '7401102508980001', 'ARWIN SOMBOLAYUK', 'MUARA LAPAO-PAO', 'ANDRI RIVALDI'],
        ['Wolo', '7401100804160001', '7401104704950001', 'RAHMA', 'TOLOWE PONRE WARU', 'APRILIYA SUCI LESTARI'],
        ['Wolo', '7401101102090001', '7401102606880003', 'MUSHAR', 'LAPAO-PAO', 'MUSHAR'],
        ['Wolo', '7401101803150003', '7401105203730004', 'ROSTANG', 'LAPAO-PAO', 'SUKMIATI'],
        ['Wolo', '7401100612120001', '7401106707960003', 'ASTRID ALECIA', 'ULU WOLO', 'HARTINA'],
        ['Wolo', '7401101101240001', '7401105505990003', 'LILIS SUSI YANTI', 'ULU WOLO', 'LILIS SUSI YANTI'],
        ['Wolo', '7401101408080005', '7401100710820001', 'SIRAJUDDIN', 'MUARA LAPAO-PAO', 'HASLUDDIN'],
        ['Wolo', '7401103101190001', '7401101602910001', 'NUR ALIM M. SYAM S.Kom', 'ULU WOLO', 'NUR ALIM'],
        ['Wolo', '7401101911190002', '7401102407900002', 'MUH. RADJULIUN, SKM', 'TOLOWE PONRE WARU', 'MUH. RAJULIUN'],
        ['Wolo', '7401102704110005', '7401100711020006', 'MUHAMMAD KASMAN', 'SAMAENRE', 'JUSMAN'],
        ['Wolo', '7401102603120004', '7401100510010006', 'MUH. AINUL YAQIN', 'ULU WOLO', 'RISWAN'],
    ];

    akData.forEach((row, i) => {
        const r = sheetAK.addRow([i + 1, ...row]);
        const isOdd = i % 2 === 0;
        const namaDB = row[3], namaExcel = row[5];
        r.eachCell((cell, colNum) => {
            cell.alignment = { vertical: 'middle', horizontal: colNum <= 3 ? 'center' : 'left', wrapText: true };
            cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            if (colNum >= 4 && colNum <= 6) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isOdd ? 'FFE8F5E9' : 'FFC8E6C9' } };
            } else if (colNum === 7) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isOdd ? 'FFFCE4EC' : 'FFF8BBD9' } };
            } else {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isOdd ? 'FFEDE7F6' : 'FFD1C4E9' } };
            }
        });
        if (namaDB !== namaExcel) {
            r.getCell(5).font = { bold: true, color: { argb: 'FF8B0000' } };
            r.getCell(7).font = { bold: true, color: { argb: 'FF1A237E' } };
        }
        r.height = 22;
    });

    sheetAK.columns = [{ width: 5 }, { width: 16 }, { width: 20 }, { width: 20 }, { width: 28 }, { width: 22 }, { width: 28 }];
    sheetAK.getRow(1).height = 28;

    // =============================================
    // SHEET 3: Duplikat Pra Sejahtera
    // =============================================
    const sheetPS = workbook.addWorksheet('Duplikat Pra Sejahtera');

    sheetPS.mergeCells('A1:C1');
    sheetPS.getCell('A1').value = 'IDENTITAS';
    sheetPS.mergeCells('D1:E1');
    sheetPS.getCell('D1').value = '📂 DATA SEBELUMNYA (Database)';
    sheetPS.mergeCells('F1:F1');
    sheetPS.getCell('F1').value = '📥 DATA BARU DARI EXCEL (Menimpa)';

    ['A1','B1','C1'].forEach(c => Object.assign(sheetPS.getCell(c), headerStyle('FF1565C0')));
    ['D1','E1'].forEach(c => Object.assign(sheetPS.getCell(c), headerStyle('FF2E7D32')));
    ['F1'].forEach(c => Object.assign(sheetPS.getCell(c), headerStyle('FFC62828')));

    sheetPS.getRow(2).values = ['No', 'Sumber File Excel', 'No KK', 'NIK Penduduk', 'Nama (DB)', 'Desa (DB)', 'Nama di Excel'];
    sheetPS.getRow(2).eachCell(cell => {
        cell.font = { bold: true, size: 10 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = { top: { style: 'thin' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
    });
    sheetPS.getRow(2).height = 30;

    const psData = [
        ['Wolo', '7401101210200002', '7401104107580033', 'MARE', 'MUARA LAPAO-PAO', 'MASAYA'],
        ['Wolo', '7401101007130007', '7401104107490016', 'NOI', 'ULU WOLO', 'MATAHARI'],
    ];

    psData.forEach((row, i) => {
        const r = sheetPS.addRow([i + 1, ...row]);
        const isOdd = i % 2 === 0;
        r.eachCell((cell, colNum) => {
            cell.alignment = { vertical: 'middle', horizontal: colNum <= 3 ? 'center' : 'left', wrapText: true };
            cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            if (colNum >= 4 && colNum <= 6) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isOdd ? 'FFE8F5E9' : 'FFC8E6C9' } };
            } else if (colNum === 7) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isOdd ? 'FFFCE4EC' : 'FFF8BBD9' } };
            } else {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isOdd ? 'FFEDE7F6' : 'FFD1C4E9' } };
            }
        });
        r.getCell(5).font = { bold: true, color: { argb: 'FF8B0000' } };
        r.getCell(7).font = { bold: true, color: { argb: 'FF1A237E' } };
        r.height = 22;
    });

    sheetPS.columns = [{ width: 5 }, { width: 16 }, { width: 20 }, { width: 20 }, { width: 28 }, { width: 22 }, { width: 28 }];
    sheetPS.getRow(1).height = 28;

    const outPath = path.join('E:/Projek/Sikamali/Sikamali-main', 'Rekap_Duplikat_Data.xlsx');
    await workbook.xlsx.writeFile(outPath);
    console.log('Report generated: ' + outPath);
}

generateReport().catch(console.error);
