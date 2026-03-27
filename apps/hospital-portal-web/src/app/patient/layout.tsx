'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Calendar,
  FileText,
  TestTube,
  MessageSquare,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Heart,
  Phone,
  Mail,
  Clock,
  MapPin,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface PatientInfo {
  id: string;
  name: string;
  mrn: string;
  email: string;
  phone: string;
  avatar?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/patient/dashboard', icon: Home },
  { name: 'My Appointments', href: '/patient/appointments', icon: Calendar },
  { name: 'Prescriptions', href: '/patient/prescriptions', icon: FileText },
  { name: 'Test Results', href: '/patient/results', icon: TestTube },
  { name: 'Messages', href: '/patient/messages', icon: MessageSquare },
  { name: 'Payments', href: '/patient/payments', icon: CreditCard },
  { name: 'My Profile', href: '/patient/profile', icon: User },
];

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  // Check if we're on auth pages
  const isAuthPage = pathname === '/patient/login' || pathname === '/patient/register' || pathname === '/patient/forgot-password';

  // Mock patient info - in real app, get from auth context
  const patient: PatientInfo = {
    id: 'PAT-001',
    name: 'Rajesh Kumar',
    mrn: 'MRN-2024-001',
    email: 'rajesh.kumar@email.com',
    phone: '+91 98765 43210',
  };

  // Don't show layout for auth pages
  if (isAuthPage) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    // Clear auth tokens and redirect
    router.push('/patient/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link href="/patient/dashboard" className="flex items-center gap-2 ml-2 lg:ml-0">
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold text-gray-900">Hospital Portal</span>
                  <span className="text-xs text-gray-500 block">Patient Portal</span>
                </div>
              </Link>
            </div>

            {/* Right side - Notifications & Profile */}
            <div className="flex items-center gap-4">
              {/* Emergency Contact */}
              <a href="tel:+911234567890" className="hidden md:flex items-center gap-2 text-red-600 hover:text-red-700">
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">Emergency: 1234-567-890</span>
              </a>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                <Bell className="h-6 w-6" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                    <p className="text-xs text-gray-500">{patient.mrn}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                      <p className="text-xs text-gray-500">{patient.email}</p>
                    </div>
                    <Link
                      href="/patient/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                    <Link
                      href="/patient/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4" />
                      Privacy Settings
                    </Link>
                    <Link
                      href="/patient/help"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <HelpCircle className="h-4 w-4" />
                      Help & Support
                    </Link>
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
            <nav className="p-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Info Card */}
            <div className="mx-4 mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Need Help?</h4>
              <p className="text-xs text-blue-700 mb-3">
                Contact our support team for any queries
              </p>
              <div className="space-y-2">
                <a href="tel:+911234567890" className="flex items-center gap-2 text-xs text-blue-700 hover:text-blue-800">
                  <Phone className="h-3 w-3" />
                  +91 1234 567 890
                </a>
                <a href="mailto:support@hospital.com" className="flex items-center gap-2 text-xs text-blue-700 hover:text-blue-800">
                  <Mail className="h-3 w-3" />
                  support@hospital.com
                </a>
              </div>
            </div>

            {/* Hospital Hours */}
            <div className="mx-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hospital Hours
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Mon - Sat: 8:00 AM - 8:00 PM</p>
                <p>Sunday: 9:00 AM - 2:00 PM</p>
                <p className="text-red-600 font-medium">Emergency: 24/7</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-gray-900">Hospital Portal</span>
                    <span className="text-xs text-gray-500 block">Patient Portal</span>
                  </div>
                </div>
              </div>
              <nav className="p-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <Link href="/patient/privacy" className="hover:text-gray-700">Privacy Policy</Link>
              <span>•</span>
              <Link href="/patient/terms" className="hover:text-gray-700">Terms of Service</Link>
              <span>•</span>
              <Link href="/patient/help" className="hover:text-gray-700">Help Center</Link>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 Hospital Portal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
