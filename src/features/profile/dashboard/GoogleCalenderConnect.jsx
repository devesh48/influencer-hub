// src/features/profile/dashboard/GoogleCalendarConnect.tsx
import { useUser } from "@clerk/clerk-react";

export default function GoogleCalendarConnect() {
  const { user, isLoaded, isSignedIn } = useUser();

  const handleConnect = () => {
    if (!isLoaded || !isSignedIn || !user?.id) {
      alert("Please sign in first");
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      console.error("Missing Google OAuth env variables");
      alert("Google Connect is not configured yet. Contact support.");
      return;
    }

    const state = user.id; // Clerk user ID

    // Build auth URL with proper encoding and separators
    const authUrl =
      "https://accounts.google.com/o/oauth2/v2/auth" +
      "?" +
      `client_id=${encodeURIComponent(clientId)}` +
      "&" +
      `redirect_uri=${encodeURIComponent(redirectUri)}` +
      "&" +
      "response_type=code" +
      "&" +
      `scope=${encodeURIComponent("https://www.googleapis.com/auth/calendar.events")}` +
      "&" +
      "access_type=offline" +
      "&" +
      "prompt=consent" +
      "&" +
      `state=${encodeURIComponent(state)}`;

    console.log("Redirecting to Google OAuth:", authUrl); // Debug: check this in console

    window.location.href = authUrl;
  };

  if (!isLoaded) {
    return <div className="p-8 text-center">Loading user info...</div>;
  }

  if (!isSignedIn) {
    return <div className="p-8 text-center">Please sign in to connect your calendar.</div>;
  }

  return (
    <div className="p-8 max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold mb-6">Connect Google Calendar</h2>
      <p className="text-gray-600 mb-8">
        Allow your followers to book 1:1 sessions directly in your calendar.
      </p>
      <button
        onClick={handleConnect}
        className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-md transition transform hover:scale-105"
      >
        Connect with Google
      </button>
      <p className="mt-6 text-sm text-gray-500">
        You’ll be redirected to Google to authorize access. This is a one-time setup.
      </p>
    </div>
  );
}