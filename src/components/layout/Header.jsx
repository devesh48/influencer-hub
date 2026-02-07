// src/components/layout/Header.jsx
import { Link } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import {
  ArrowLeftIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useSupabase } from "../../contexts/SupabaseContext";
import { useState, useEffect } from "react";

export default function Header({ onMobileMenuToggle, isMobileMenuOpen }) {
  const { user } = useUser();
  const { supabaseAuth, loading: authLoading } = useSupabase();

  const [dbUsername, setDbUsername] = useState(null);
  const [fetchingUsername, setFetchingUsername] = useState(true);

  // Fetch username from DB only once when component mounts or auth changes
  useEffect(() => {
    if (!user?.id || !supabaseAuth || authLoading) return;

    async function fetchUsername() {
      setFetchingUsername(true);
      try {
        const { data, error } = await supabaseAuth
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setDbUsername(data?.username || null);
      } catch (err) {
        console.error("Failed to fetch username from DB:", err);
      } finally {
        setFetchingUsername(false);
      }
    }

    fetchUsername();
  }, [user?.id, supabaseAuth, authLoading]);

  // Use DB value first, fall back to Clerk metadata if DB fetch hasn't completed
  const publicUsername =
    dbUsername || user?.publicMetadata?.username || "profile";

  const hasPublicPage = !!publicUsername && publicUsername !== "profile";

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
            {/* View public page – always prefers DB username */}
            <a
              href={hasPublicPage ? `/${publicUsername}` : "#"}
              target={hasPublicPage ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 transition-colors ${
                hasPublicPage
                  ? "text-purple-600 hover:text-purple-800"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              title={
                hasPublicPage
                  ? "View your public page"
                  : fetchingUsername
                    ? "Loading your profile..."
                    : "Complete your profile setup first"
              }
              onClick={!hasPublicPage ? (e) => e.preventDefault() : undefined}
            >
              <span className="hidden sm:inline text-sm font-medium">
                {fetchingUsername
                  ? 'Loading...'
                  : hasPublicPage
                  ? 'View public page'
                  : 'Public page (setup required)'}
              </span>
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
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
