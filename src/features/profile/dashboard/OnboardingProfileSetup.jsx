import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { supabase } from '../../../lib/supabaseClient';

export default function OnboardingProfileSetup() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState(user?.firstName || '');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  // Auto-fill name from Clerk if available
  useEffect(() => {
    if (user?.firstName) {
      setDisplayName(user.firstName);
    }
  }, [user]);

  // Check username availability (debounced or on blur in real app)
  const checkUsername = async () => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error(error);
      setError('Could not check username');
    } else {
      setUsernameAvailable(!data); // true = available
    }
    setCheckingUsername(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !displayName) {
      setError('Username and display name are required');
      return;
    }

    if (!usernameAvailable) {
      setError('Username is already taken');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabaseAccessToken = await getToken({ template: 'supabase' });

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username.toLowerCase(),
          display_name: displayName.trim(),
          bio: bio.trim(),
          instagram: instagram.trim() || null,
          avatar_url: user?.imageUrl || null,
          created_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });

      if (upsertError) throw upsertError;

      // Optional: update Clerk public metadata if you want
      await user.update({
        publicMetadata: { username: username.toLowerCase() },
      });

      // Redirect to dashboard after success
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-center mb-2">Welcome! Let's set up your profile</h1>
        <p className="text-center text-gray-600 mb-10">
          Choose a unique username and tell the world a bit about yourself
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.replace(/\s+/g, ''));
                  setUsernameAvailable(null);
                }}
                onBlur={checkUsername}
                placeholder="youruniquehandle"
                className={`block w-full pl-8 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  usernameAvailable === true
                    ? 'border-green-500'
                    : usernameAvailable === false
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                required
                minLength={3}
                pattern="[a-zA-Z0-9_]+"
                title="Only letters, numbers, and underscores"
              />
            </div>

            {checkingUsername && (
              <p className="mt-1 text-sm text-gray-500">Checking availability...</p>
            )}
            {usernameAvailable === true && username.length >= 3 && (
              <p className="mt-1 text-sm text-green-600">✓ Available!</p>
            )}
            {usernameAvailable === false && (
              <p className="mt-1 text-sm text-red-600">Sorry, this username is taken.</p>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tanvi Rateria"
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio / Tagline
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Helping you manifest love, abundance & soul-aligned relationships ✨"
              rows={3}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instagram Handle
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                @
              </span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value.replace(/\s+/g, ''))}
                placeholder="yourinsta"
                className="block w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !usernameAvailable || checkingUsername}
            className={`w-full py-4 px-6 text-white font-medium rounded-xl transition-all ${
              loading || !usernameAvailable || checkingUsername
                ? 'bg-purple-300 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? 'Saving...' : 'Complete Setup & Go to Dashboard'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          You can edit these details later in Settings
        </p>
      </div>
    </div>
  );
}