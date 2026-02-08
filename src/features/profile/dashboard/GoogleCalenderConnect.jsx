export default function GoogleCalendarConnect() {
  const handleConnect = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    const scope = 'https://www.googleapis.com/auth/calendar.events';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    window.location.href = authUrl;
  };

  return (
    <div className="p-8 max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold mb-6">Connect Google Calendar</h2>
      <p className="text-gray-600 mb-8">
        Allow your followers to book 1-on-1 sessions directly in your calendar.
      </p>
      <button
        onClick={handleConnect}
        className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-md"
      >
        Connect with Google
      </button>
      <p className="mt-6 text-sm text-gray-500">
        You’ll be redirected to Google to authorize access.
      </p>
    </div>
  );
}