const fs = require('fs');
const src = fs.readFileSync('src/components/patients/PatientDetailsModal.tsx', 'utf8');
const lines = src.split('\n');

// Search for < or > inside strings or comments in lines 1-890
for (let i = 0; i < 890 && i < lines.length; i++) {
  const line = lines[i];
  // Check for < or > that's inside a string literal (not JSX)
  // Simple check: find < or > and see if it's within quotes
  let inSingle = false, inDouble = false, inTemplate = false;
  for (let j = 0; j < line.length; j++) {
    const c = line[j];
    if (c === '\\') { j++; continue; }
    if (c === "'" && !inDouble && !inTemplate) { inSingle = !inSingle; continue; }
    if (c === '"' && !inSingle && !inTemplate) { inDouble = !inDouble; continue; }
    if (c === '`' && !inSingle && !inDouble) { inTemplate = !inTemplate; continue; }
    if ((inSingle || inDouble || inTemplate) && (c === '<' || c === '>')) {
      console.log(`Line ${i+1}, col ${j+1}: '${c}' inside string: ...${line.substring(Math.max(0,j-20), j+20)}...`);
    }
  }
}
console.log('Done scanning lines 1-890');
