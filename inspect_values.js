const xlsx = require('xlsx');
const path = require('path');

const filePath = 'e:\\Projek\\Sikamali\\Sikamali-main\\backend\\Sikamali Lapao-Pao Database_Final_import.xlsx';

try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = '4. Data Pra Sejahtera';
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const kategoriSosialValues = new Set();
    const tingkatSosialValues = new Set();

    data.forEach(row => {
        if (row['KATEGORI SOSIAL']) kategoriSosialValues.add(row['KATEGORI SOSIAL']);
        if (row[' TINGKAT SOSIAL']) tingkatSosialValues.add(row[' TINGKAT SOSIAL']);
    });

    console.log('Unique KATEGORI SOSIAL:', Array.from(kategoriSosialValues));
    console.log('Unique TINGKAT SOSIAL:', Array.from(tingkatSosialValues));
} catch (err) {
    console.error('Error reading Excel file:', err.message);
}
