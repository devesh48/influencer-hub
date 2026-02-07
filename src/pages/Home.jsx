import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export default function Home() {
  const { isSignedIn, user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      {/* Navigation Bar */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              H
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              CreatorHub
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <Link
                to="/dashboard"
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/sign-up"
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition shadow-sm"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 lg:pt-32 lg:pb-32 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Turn your social audience
          </span>
          <br />
          into your business
        </h1>

        <p className="mt-8 text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          One beautiful link-in-bio page + powerful dashboard to sell courses, sessions, readings, meditations — and actually see what works.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center items-center">
          {isSignedIn ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center px-10 py-5 text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all duration-300"
            >
              Open Dashboard →
            </Link>
          ) : (
            <>
              <Link
                to="/sign-up"
                className="inline-flex items-center px-10 py-5 text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all duration-300"
              >
                Start for Free
              </Link>

              <Link
                to="/sign-in"
                className="inline-flex items-center px-10 py-5 text-xl font-semibold border-2 border-purple-200 hover:border-purple-400 text-purple-700 rounded-2xl transition-all duration-300 hover:bg-purple-50"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Social proof line */}
        <div className="mt-16 text-gray-600">
          <p className="text-lg">
            Trusted by creators, coaches, tarot readers, manifestation guides & spiritual entrepreneurs
          </p>
        </div>

        {/* Very small mock social icons row – optional */}
        <div className="mt-10 flex justify-center gap-8 text-4xl text-gray-400 opacity-70">
          <i className="fab fa-instagram"></i>
          <i className="fab fa-tiktok"></i>
          <i className="fab fa-youtube"></i>
        </div>
      </main>

      {/* Footer – minimal */}
      <footer className="border-t bg-white py-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} CreatorHub • All rights reserved</p>
        <p className="mt-2">
          Built for influencers who want to monetize without complexity
        </p>
      </footer>
    </div>
  );
}