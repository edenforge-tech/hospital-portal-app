const fs = require('fs');
const swc = require('next/dist/build/swc');

const src = fs.readFileSync('src/components/patients/PatientDetailsModal.tsx', 'utf8');
const lines = src.split('\n');

// Binary search: find the minimum number of lines from the start that causes the error
async function testLines(startLine, endLine, contentLines) {
  // Build a valid file: imports + component start + selected lines + minimal JSX + component end
  const header = contentLines.slice(0, startLine).join('\n');
  const body = contentLines.slice(startLine, endLine).join('\n');
  const test = header + '\n' + body + `
  const testVar = (
    <div className="test">hello</div>
  );
  return testVar;
}
`;
  try {
    await swc.transform(test, { filename: 'test.tsx', jsc: { parser: { syntax: 'typescript', tsx: true } } });
    return true; // OK
  } catch(e) {
    return false; // Error
  }
}

async function main() {
  // First, test with NO inner content (just imports + component shell + JSX)
  const minFile = `'use client';
import React, { useState } from 'react';
export function PatientDetailsModal() {
  const [x, setX] = useState(0);
  const tabContentElement = (
    <div className="test">hello</div>
  );
  return tabContentElement;
}`;
  try {
    await swc.transform(minFile, { filename: 'test.tsx', jsc: { parser: { syntax: 'typescript', tsx: true } } });
    console.log('Minimal shell: OK');
  } catch(e) {
    console.log('Minimal shell: ERROR - ', e.message?.substring(0, 100));
    return;
  }

  // Now try adding chunks: use original lines 83 to 889 (inside the component)
  // Line 83 is where the component starts (0-indexed: 82)
  // Line 889 is the empty line before tabContentElement
  const componentBodyStart = 90; // after the destructuring and first useState (0-indexed)
  const componentBodyEnd = 889; // 0-indexed

  // Binary search: what's the last line we can include and still parse?
  let lo = componentBodyStart;
  let hi = componentBodyEnd;
  
  // First, check: does including ALL the body lines cause the error?
  let chunk = lines.slice(0, 83).join('\n') + '\n' + // imports + function signature
    lines.slice(83, componentBodyEnd).join('\n') + '\n' + // all body content
    `  const testVar = (
    <div className="test">hello</div>
  );
  return testVar;
}`;
  
  try {
    await swc.transform(chunk, { filename: 'test.tsx', jsc: { parser: { syntax: 'typescript', tsx: true } } });
    console.log('Full body (lines 1-889): OK');
    return;
  } catch(e) {
    console.log('Full body (lines 1-889): ERROR');
  }

  // Binary search for the problematic section
  // Start with the full file headers
  const header = lines.slice(0, 90).join('\n'); // imports + function start + first few useStates
  
  // Test: is header + JSX ok?
  let testSrc = header + '\n' + `  const testVar = (
    <div className="test">hello</div>
  );
  return testVar;
}`;
  try {
    await swc.transform(testSrc, { filename: 'test.tsx', jsc: { parser: { syntax: 'typescript', tsx: true } } });
    console.log('Lines 1-90 + JSX: OK');
  } catch(e) {
    console.log('Lines 1-90 + JSX: ERROR -', e.message?.substring(0, 100));
    return;
  }

  // Now bisect: try adding chunks of lines
  const chunkSize = 50;
  let currentEnd = 90;
  while (currentEnd < componentBodyEnd) {
    const nextEnd = Math.min(currentEnd + chunkSize, componentBodyEnd);
    testSrc = lines.slice(0, nextEnd).join('\n') + '\n' + `  const testVar = (
    <div className="test">hello</div>
  );
  return testVar;
}`;
    try {
      await swc.transform(testSrc, { filename: 'test.tsx', jsc: { parser: { syntax: 'typescript', tsx: true } } });
      console.log(`Lines 1-${nextEnd}: OK`);
      currentEnd = nextEnd;
    } catch(e) {
      console.log(`Lines 1-${nextEnd}: ERROR - PROBLEM IS BETWEEN LINES ${currentEnd+1} AND ${nextEnd}`);
      
      // Fine-grained search within this chunk
      for (let line = currentEnd + 1; line <= nextEnd; line++) {
        testSrc = lines.slice(0, line).join('\n') + '\n' + `  const testVar = (
    <div className="test">hello</div>
  );
  return testVar;
}`;
        try {
          await swc.transform(testSrc, { filename: 'test.tsx', jsc: { parser: { syntax: 'typescript', tsx: true } } });
        } catch(e2) {
          console.log(`EXACT LINE: ${line} - "${lines[line-1].trim().substring(0, 80)}"`);
          console.log(`Previous:   ${line-1} - "${lines[line-2].trim().substring(0, 80)}"`);
          break;
        }
      }
      break;
    }
  }
  
  if (currentEnd >= componentBodyEnd) {
    console.log('All lines OK individually - problem might be in interactions');
  }
}

main().catch(console.error);
