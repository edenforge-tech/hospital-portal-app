const fs = require('fs');
const src = fs.readFileSync('src/components/patients/PatientDetailsModal.tsx', 'utf8');
const lines = src.split('\n');
let braces = 0, parens = 0, brackets = 0;
let inString = false, strChar = '';
let inTemplate = 0;
let inLineComment = false, inBlockComment = false;
const issues = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  inLineComment = false;
  for (let j = 0; j < line.length; j++) {
    const c = line[j], nc = line[j+1];
    if (inBlockComment) { if (c === '*' && nc === '/') { inBlockComment = false; j++; } continue; }
    if (inLineComment) continue;
    if (inString) { if (c === '\\') { j++; continue; } if (c === strChar) { inString = false; } continue; }
    if (inTemplate > 0 && c === '`') { inTemplate--; continue; }
    if (c === '/' && nc === '/') { inLineComment = true; continue; }
    if (c === '/' && nc === '*') { inBlockComment = true; j++; continue; }
    if (c === '"' || c === "'") { inString = true; strChar = c; continue; }
    if (c === '`') { inTemplate++; continue; }
    if (c === '{') braces++;
    if (c === '}') braces--;
    if (c === '(') parens++;
    if (c === ')') parens--;
    if (c === '[') brackets++;
    if (c === ']') brackets--;
    if (braces < 0 || parens < 0 || brackets < 0) {
      issues.push('Line ' + (i+1) + ': NEGATIVE! braces=' + braces + ' parens=' + parens + ' brackets=' + brackets);
    }
  }
  if ((i+1) % 100 === 0 || i+1 === 888 || i+1 === 889 || i+1 === 890 || i+1 === 891) {
    console.log('Line ' + (i+1) + ': braces=' + braces + ' parens=' + parens + ' brackets=' + brackets);
  }
}
console.log('END (line ' + lines.length + '): braces=' + braces + ' parens=' + parens + ' brackets=' + brackets);
if (issues.length) { console.log('ISSUES:'); issues.forEach(x => console.log('  ' + x)); }
else console.log('No negative counts detected');
