'use client';

import { useAuthStore } from '@/lib/auth-store';

export default function TopNav() {
  const { user, logout } = useAuthStore();

  return (
    <div className="bg-white border-b p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button className="text-gray-600">☰</button>
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="text-sm text-gray-700">{user.firstName} {user.lastName}</div>
        )}
        <button
          onClick={() => logout()}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
