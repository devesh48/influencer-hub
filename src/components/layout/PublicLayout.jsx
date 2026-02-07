import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Optional top announcement bar – can be removed or made conditional */}
      {/* <div className="bg-purple-600 text-white text-center py-2 text-sm">
        New: 30-day money-back guarantee on all digital products
      </div> */}

      {/* Main content – usually just the creator profile page */}
      <main>
        <Outlet />
      </main>

      {/* Minimal footer for public pages */}
      <footer className="bg-white border-t py-8 text-center text-gray-500 text-sm">
        <p>Powered by CreatorHub</p>
        <p className="mt-2">
          <a href="/" className="text-purple-600 hover:text-purple-800">
            Create your own page
          </a>
          {' • '}
          <a href="/terms" className="hover:text-gray-700">
            Terms
          </a>
          {' • '}
          <a href="/privacy" className="hover:text-gray-700">
            Privacy
          </a>
        </p>
      </footer>
    </div>
  );
}