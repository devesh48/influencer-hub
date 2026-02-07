// src/features/profile/dashboard/PublicProfileSettings.jsx
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSupabase } from '../../../contexts/SupabaseContext';

export default function PublicProfileSettings() {
  const { user } = useUser();
  const { supabaseAuth } = useSupabase();

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    instagram: '',
    avatar_url: '',
    background_gradient: 'from-purple-600 via-purple-700 to-pink-600',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load current profile data on mount
  useEffect(() => {
    if (!supabaseAuth || !user) return;

    async function loadProfile() {
      setLoading(true);
      try {
        const { data, error } = await supabaseAuth
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

        if (data) {
          setFormData({
            display_name: data.display_name || user.firstName || '',
            bio: data.bio || '',
            instagram: data.instagram || '',
            avatar_url: data.avatar_url || user.imageUrl || '',
            background_gradient: data.background_gradient || 'from-purple-600 via-purple-700 to-pink-600',
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Could not load your current profile data');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [supabaseAuth, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const { error } = await supabaseAuth
        .from('profiles')
        .update({
          display_name: formData.display_name.trim(),
          bio: formData.bio.trim(),
          instagram: formData.instagram.trim() || null,
          avatar_url: formData.avatar_url.trim() || null,
          background_gradient: formData.background_gradient.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Optional: sync username if changed (but username usually immutable)
      if (formData.username && formData.username !== user.publicMetadata?.username) {
        await user.update({
          publicMetadata: { ...user.publicMetadata, username: formData.username.toLowerCase() },
        });
      }

      setSuccess('Public profile updated successfully!');
    } catch (err) {
      console.error('Save failed:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Public Profile Settings</h1>
      <p className="text-gray-600 mb-10">
        This information appears on your public page that visitors see.
      </p>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Form */}
        <div className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio / Tagline
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram Handle
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">@</span>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="w-full pl-8 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Gradient (CSS format)
              </label>
              <input
                type="text"
                name="background_gradient"
                value={formData.background_gradient}
                onChange={handleChange}
                placeholder="from-purple-600 via-purple-700 to-pink-600"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Example: from-indigo-600 to-purple-600
              </p>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-4 px-6 text-white font-medium rounded-xl transition-all ${
                  saving
                    ? 'bg-purple-300 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg'
                }`}
              >
                {saving ? 'Saving...' : 'Save Public Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
          <div
            className={`rounded-2xl overflow-hidden shadow-2xl p-8 min-h-[400px] flex flex-col items-center justify-center text-center bg-gradient-to-br ${formData.background_gradient}`}
          >
            <img
              src={formData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.display_name || 'User')}&size=128`}
              alt="Preview avatar"
              className="w-24 h-24 rounded-full border-4 border-white/40 shadow-xl mb-6 object-cover"
            />

            <h2 className="text-3xl font-bold mb-3">
              {formData.display_name || 'Your Name'}
            </h2>

            <p className="text-lg opacity-90 max-w-md">
              {formData.bio || 'Your bio / tagline will appear here...'}
            </p>

            {formData.instagram && (
              <div className="mt-8 text-5xl">
                <a
                  href={`https://instagram.com/${formData.instagram}`}
                  target="_blank"
                  className="text-white hover:text-pink-300 transition-colors"
                >
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}