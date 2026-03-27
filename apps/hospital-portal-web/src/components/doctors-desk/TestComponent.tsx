'use client';

import { useState } from 'react';

export default function TestComponent() {
  const [test, setTest] = useState('hello');

  const sections = [
    { id: 'test', label: 'Test' },
  ];

  return (
    <div className="bg-white">
      <p>Test Component</p>
    </div>
  );
}
