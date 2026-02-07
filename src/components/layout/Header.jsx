// src/components/layout/Header.jsx
import { Link } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { ArrowLeftIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Header({ onMobileMenuToggle, isMobileMenuOpen }) {
  const { user } = useUser();
  const username = user?.username || user?.firstName?.toLowerCase() || 'creator';

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side – Back to home (icon on mobile, text+icon on larger) */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              // className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold"
              className="flex items-center gap-1.5 text-purple-700 hover:text-purple-800 transition-colors group"
              title="Back to home"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Back to home</span>
            </Link>
            <div className="sm:hidden w-10" />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href={`/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 hover:text-purple-800 sm:flex items-center gap-1.5"
              // className="text-gray-700 hover:text-purple-600 transition-colors group"
              title="View your public page">
              <span className="hidden sm:inline ml-1.5">View public page</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Hamburger button – visible only on mobile */}
            <button
              className="md:hidden text-gray-700 hover:text-purple-700 focus:outline-none"
              onClick={onMobileMenuToggle}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-7 w-7" />
              ) : (
                <Bars3Icon className="h-7 w-7" />
              )}
            </button>

            {/* User avatar – always visible */}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                  userPreviewMainIdentifier: "font-medium",
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}