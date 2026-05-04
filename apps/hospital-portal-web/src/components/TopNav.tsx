'use client';

import { useAuthStore } from '@/lib/auth-store';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const LiveActivityFeed = dynamic(() => import('@/components/LiveActivityFeed'), {
  ssr: false,
  loading: () => <span className="w-8 h-8" />,
});
import { AudioRecorderPanel } from '@/components/counselor/AudioRecorderPanel';
import { Menu } from 'lucide-react';

interface TopNavProps {
  onMenuClick?: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  // Detect counselor session page and extract sessionId
  const sessionMatch = pathname?.match(/\/dashboard\/counselor\/sessions\/([^/]+)/);
  const counselorSessionId = sessionMatch?.[1] ?? null;

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* Hamburger — visible only below 1024px (tablet/mobile) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
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
