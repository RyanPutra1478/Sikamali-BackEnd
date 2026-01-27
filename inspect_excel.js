const xlsx = require('xlsx');
const path = require('path');

const filePath = 'e:\\Projek\\Sikamali\\Sikamali-main\\backend\\Sikamali Lapao-Pao Database_Final_import.xlsx';

try {
    const workbook = xlsx.readFile(filePath);
    console.log('Sheet Names:', workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        if (data.length > 0) {
            console.log(`\nSheet: ${sheetName}`);
            console.log('Columns:', data[0]);
            console.log('Sample Data (Row 1):', data[1]);
        }
    });
} catch (err) {
    console.error('Error reading Excel file:', err.message);
}
