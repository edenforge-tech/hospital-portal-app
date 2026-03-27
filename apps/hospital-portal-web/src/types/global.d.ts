/**
 * Global type overrides for React 18 compatibility
 */

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      className?: string;
      [key: string]: any;
    }
  }
}

// Explicitly type the Icon components to avoid FC issues
declare module 'lucide-react' {
  export * from 'lucide-react';
}

declare module 'recharts' {
  export * from 'recharts';
}

export {};
