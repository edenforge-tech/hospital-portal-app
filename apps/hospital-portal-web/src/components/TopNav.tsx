'use client';

import { useAuthStore } from '@/lib/auth-store';
import LiveActivityFeed from '@/components/LiveActivityFeed';
import { usePathname } from 'next/navigation';
import { AudioRecorderPanel } from '@/components/counselor/AudioRecorderPanel';

export default function TopNav() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  // Detect counselor session page and extract sessionId
  const sessionMatch = pathname?.match(/\/dashboard\/counselor\/sessions\/([^/]+)/);
  const counselorSessionId = sessionMatch?.[1] ?? null;

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* Breadcrumb or page title can go here if needed */}
      </div>

      <div className="flex items-center space-x-4">
        {/* Counselor session audio recorder — shown only during active counseling session */}
        {counselorSessionId && (
          <AudioRecorderPanel sessionId={counselorSessionId} autoStart={true} />
        )}

        {/* Phase 3: Live Activity Feed */}
        <LiveActivityFeed />
        
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
