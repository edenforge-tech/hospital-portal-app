const fs = require('fs');
const swc = require('next/dist/build/swc');

const src = fs.readFileSync('src/components/patients/PatientDetailsModal.tsx', 'utf8');
const lines = src.split('\n');

async function testWithLines(endLine) {
  // Take lines 1-endLine, then close all open tags properly
  let testSrc = lines.slice(0, endLine).join('\n');
  // Count open divs etc to close them - just add a simple closure
  testSrc += '\n</div></div></div></div></div></div></div></div></div></div>';
  testSrc += '\n  );\n  return tabContentElement;\n}\n';
  
  try {
    await swc.transform(testSrc, { filename: 'test.tsx', jsc: { parser: { syntax: 'typescript', tsx: true } } });
    return 'OK';
  } catch(e) {
    return 'ERROR: ' + (e.message?.substring(0, 150) || 'unknown');
  }
}

async function main() {
  // Test with lines up to just after the tabContentElement assignment
  for (const endLine of [891, 892, 893, 894, 895, 900, 910, 920, 930, 950, 1000]) {
    const result = await testWithLines(endLine);
    console.log(`Through line ${endLine}: ${result}`);
    if (result === 'OK') break;
  }
  
  // Also test: does lines 1-889 + the EXACT tabContentElement line work?
  let test2 = lines.slice(0, 889).join('\n') + '\n';
  test2 += '  const tabContentElement = (\n';
  test2 += '    <div className="flex flex-col flex-1 h-full">hello</div>\n';
  test2 += '  );\n  return tabContentElement;\n}\n';
  try {
    await swc.transform(test2, { filename: 'test.tsx', jsc: { parser: { syntax: 'typescript', tsx: true } } });
    console.log('Lines 1-889 + EXACT tabContentElement: OK');
  } catch(e) {
    console.log('Lines 1-889 + EXACT tabContentElement: ERROR -', e.message?.substring(0, 200));
  }

  // Test: lines 1-889 + simple but MULTI-LINE JSX
  let test3 = lines.slice(0, 889).join('\n') + '\n';
  test3 += '  const tabContentElement = (\n';
  test3 += '    <div className="flex flex-col flex-1 h-full">\n';
  test3 += '      <div className="border-b bg-gray-50">\n';
  test3 += '        <div className="test">hello</div>\n';
  test3 += '      </div>\n';
  test3 += '    </div>\n';
  test3 += '  );\n  return tabContentElement;\n}\n';
  try {
    await swc.transform(test3, { filename: 'test.tsx', jsc: { parser: { syntax: 'typescript', tsx: true } } });
    console.log('Lines 1-889 + multi-line JSX: OK');
  } catch(e) {
    console.log('Lines 1-889 + multi-line JSX: ERROR -', e.message?.substring(0, 200));
  }
}

main().catch(console.error);
