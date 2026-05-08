import multer from 'multer';
import csv from 'csv-parser';
import * as XLSX from 'xlsx';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';
import path from 'path';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only CSV and XLSX files are allowed'));
  },
});

export async function parseFile(filePath, originalname) {
  const ext = path.extname(originalname).toLowerCase();
  if (ext === '.csv') return parseCsv(filePath);
  return parseXlsx(filePath);
}

function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const val = Object.values(row)[0];
        if (val && typeof val === 'string' && val.trim()) {
          results.push(val.trim());
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

function parseXlsx(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  return rows
    .map((row) => (Array.isArray(row) ? String(row[0] ?? '') : ''))
    .filter((val) => val.trim().length > 0)
    .map((val) => val.trim());
}

export async function cleanupFile(filePath) {
  try { await unlink(filePath); } catch {}
}
