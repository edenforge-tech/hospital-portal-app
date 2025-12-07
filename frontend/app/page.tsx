import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Hospital Portal
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Multi-tenant Healthcare Management System
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Link href="/patients" className="block">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Patients
              </h2>
              <p className="text-gray-600">
                Manage patient records and medical history
              </p>
            </div>
          </Link>

          <Link href="/doctors" className="block">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">👨‍⚕️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Doctors
              </h2>
              <p className="text-gray-600">
                View and manage healthcare providers
              </p>
            </div>
          </Link>

          <Link href="/appointments" className="block">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Appointments
              </h2>
              <p className="text-gray-600">
                Schedule and track patient appointments
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Multi-Tenant Architecture
            </h3>
            <p className="text-sm text-gray-600">
              This system supports multiple healthcare organizations with complete data isolation.
              Set your tenant ID in the header to access your organization's data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
