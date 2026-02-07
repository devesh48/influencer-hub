// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ChartBarIcon,
  PaintBrushIcon,
  Cog6ToothIcon,
  LinkIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { to: "/dashboard", label: "Store", icon: HomeIcon },
  { to: "/dashboard/analytics", label: "Analytics", icon: ChartBarIcon },
  { to: "/dashboard/appearance", label: "Appearance", icon: PaintBrushIcon },
  { to: "/dashboard/settings", label: "Settings", icon: Cog6ToothIcon },
  { to: "/dashboard/public-profile", label: "Public Profile", icon: UserGroupIcon },

  // divider
  { to: "#", label: "Links & Integrations", icon: LinkIcon, divider: true },
  // { to: "#", label: "Audience", icon: UserGroupIcon }, // future
];

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-64 bg-white border-r min-h-[calc(100vh-4rem)]">
      <nav className="mt-6 px-3 space-y-1">
        {navItems.map((item) =>
          item.divider ? (
            <div key={item.label} className="pt-4 mt-4 border-t">
              <NavLink
                to={item.to}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          )
        )}
      </nav>
    </aside>
  );
}