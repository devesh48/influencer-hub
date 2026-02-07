// src/components/layout/MobileSidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ChartBarIcon,
  PaintBrushIcon,
  Cog6ToothIcon,
  LinkIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { to: "/dashboard", label: "Store", icon: HomeIcon },
  { to: "/dashboard/analytics", label: "Analytics", icon: ChartBarIcon },
  { to: "/dashboard/appearance", label: "Appearance", icon: PaintBrushIcon },
  { to: "/dashboard/settings", label: "Settings", icon: Cog6ToothIcon },
  { to: "#", label: "Links & Integrations", icon: LinkIcon, divider: true },
];

export default function MobileSidebar({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel – slides in from left */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r shadow-2xl
          transform transition-transform duration-300 ease-in-out
          md:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header inside mobile menu */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-bold text-purple-700">Menu</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-7 w-7" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="mt-4 px-3 space-y-1 overflow-y-auto h-[calc(100vh-5rem)]">
          {navItems.map((item) =>
            item.divider ? (
              <div key={item.label} className="pt-4 mt-4 border-t">
                <NavLink
                  to={item.to}
                  onClick={onClose} // close menu on click
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <item.icon className="h-6 w-6" />
                  {item.label}
                </NavLink>
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-4 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="h-6 w-6" />
                {item.label}
              </NavLink>
            )
          )}
        </nav>
      </div>
    </>
  );
}