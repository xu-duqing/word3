import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCSV(text) {
  text = text.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/);
  const rows = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const row = [];
    let insideQuote = false;
    let field = '';
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        if (insideQuote && line[j + 1] === '"') {
          field += '"';
          j++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push(field.trim());
        field = '';
      } else {
        field += char;
      }
    }
    row.push(field.trim());
    rows.push(row);
  }
  return rows;
}

const csvPath = path.join(__dirname, '../english_core_3000_merged.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const rows = parseCSV(csvContent);

const header = rows[0];
console.log('Header:', header);

const words = [];
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (row.length < 6) {
    console.warn('Row length issue at index', i, row);
    continue;
  }
  const word = row[1];
  const pos = row[3];
  const phonetic = row[4];
  const meaning = row[5];
  const exampleEN = row[7] || '';
  const exampleCN = row[8] || '';

  if (!word) continue;

  words.push({
    word: word,
    pos: pos || undefined,
    meaning: meaning || '',
    phonetic: phonetic || undefined,
    example: exampleEN ? (exampleCN ? `${exampleEN} (${exampleCN})` : exampleEN) : undefined,
  });
}

console.log(`Successfully parsed ${words.length} words.`);
console.log('Sample word 1:', words[0]);
console.log('Sample word 100:', words[99]);
console.log('Sample word 3000:', words[words.length - 1]);

const outputPath = path.join(__dirname, '../src/data/core3000.json');
fs.writeFileSync(outputPath, JSON.stringify(words, null, 2), 'utf8');
console.log('Saved to:', outputPath);
