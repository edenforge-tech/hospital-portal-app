'use client';
import React, { useState } from 'react';

export function TestComponent() {
  const [x, setX] = useState(0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabContentElement = (
    <div className="flex flex-col flex-1 h-full">
      <div className="border-b bg-gray-50">
        <p>Hello</p>
      </div>
    </div>
  );

  return tabContentElement;
}
