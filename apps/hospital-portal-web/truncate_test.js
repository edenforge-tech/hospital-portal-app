const fs = require('fs');
const src = fs.readFileSync('src/components/patients/PatientDetailsModal.tsx', 'utf8');
const lines = src.split('\n');

// Try just the first 900 lines with a proper ending
const truncated = lines.slice(0, 891).join('\n') + `
      </div>
    </div>
  );

  return tabContentElement;
}
`;
fs.writeFileSync('src/components/patients/PatientDetailsModal_test.tsx', truncated);
console.log('Created truncated file with', truncated.split('\n').length, 'lines');
