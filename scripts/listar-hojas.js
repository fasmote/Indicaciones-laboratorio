// Script temporal para listar los nombres de las hojas del Excel
const XLSX = require('xlsx');
const path = require('path');

const RUTA_EXCEL = path.join(
  __dirname,
  '../../[ORIGINAL]Tabla de indicaciones para pacientes actualizada 2024 (enviada por la RED).xlsx'
);

console.log('📖 Leyendo Excel:', RUTA_EXCEL);
console.log('');

const workbook = XLSX.readFile(RUTA_EXCEL);

console.log('📋 Hojas encontradas:');
console.log('');

workbook.SheetNames.forEach((name, index) => {
  const sheet = workbook.Sheets[name];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const rows = range.e.r - range.s.r + 1;

  console.log(`${index + 1}. "${name}"`);
  console.log(`   Filas: ~${rows}`);
  console.log('');
});
