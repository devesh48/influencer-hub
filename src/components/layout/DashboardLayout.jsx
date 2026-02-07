// src/components/layout/DashboardLayout.jsx
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ChartBarIcon, 
  PaintBrushIcon, 
  Cog6ToothIcon, 
  LinkIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';

export default function DashboardLayout() {
  const location = useLocation();

  // Simple way to get current username / profile slug (you'll replace this with real auth later)
  const profileSlug = "yourname"; // ← in real app: from auth context or URL

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-purple-700">YourHub</h1>
              <span className="text-sm text-gray-500 hidden sm:inline">
                superprofile.bio/{profileSlug}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href={`/${profileSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                View public page
              </a>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
                Share Link
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-white border-r min-h-[calc(100vh-4rem)]">
          <nav className="mt-6 px-3 space-y-1">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <HomeIcon className="h-5 w-5" />
              Store
            </NavLink>

            <NavLink
              to="/dashboard/analytics"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <ChartBarIcon className="h-5 w-5" />
              Analytics
            </NavLink>

            <NavLink
              to="/dashboard/appearance"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <PaintBrushIcon className="h-5 w-5" />
              Appearance
            </NavLink>

            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <Cog6ToothIcon className="h-5 w-5" />
              Settings
            </NavLink>

            <div className="pt-4 mt-4 border-t">
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <LinkIcon className="h-5 w-5" />
                Links & Integrations
              </a>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}