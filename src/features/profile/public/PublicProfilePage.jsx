// src/features/profile/public/PublicProfilePage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSupabase } from '../../../contexts/SupabaseContext';
import TestimonialBlock from '../../../components/store/TestimonialBlock';
import ProductCard from '../../../components/store/ProductCard';

export default function PublicProfilePage() {
  const { username } = useParams();
  const { supabaseAuth, loading: authLoading, error: authError } = useSupabase();

  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    if (authLoading || !supabaseAuth) return;
    if (authError) {
      setPageError('Authentication issue – cannot load profile');
      setPageLoading(false);
      return;
    }

    async function loadProfileData() {
      setPageLoading(true);
      setPageError(null);

      try {
        // 1. Fetch profile by username
        const { data: profileData, error: profileErr } = await supabaseAuth
          .from('profiles')
          .select('*')
          .eq('username', username.toLowerCase())
          .single();

        if (profileErr) throw profileErr;
        if (!profileData) throw new Error('Profile not found');

        setProfile(profileData);

        // 2. Fetch active products
        const { data: prodData, error: prodErr } = await supabaseAuth
          .from('products')
          .select('*')
          .eq('user_id', profileData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (prodErr) throw prodErr;
        setProducts(prodData || []);

        // 3. Fetch testimonials
        const { data: testData, error: testErr } = await supabaseAuth
          .from('testimonials')
          .select('*')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false });

        if (testErr) throw testErr;
        setTestimonials(testData || []);
      } catch (err) {
        console.error('Failed to load public profile:', err);
        setPageError(err.message || 'Failed to load creator profile');
      } finally {
        setPageLoading(false);
      }
    }

    loadProfileData();
  }, [username, supabaseAuth, authLoading, authError]);

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
      </div>
    );
  }

  if (pageError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-7xl font-bold text-purple-600 mb-6">404</h1>
        <h2 className="text-3xl font-semibold mb-4">Creator not found</h2>
        <p className="text-lg text-gray-600 mb-10 max-w-md">
          The profile you're looking for doesn't exist or may have been removed.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-10 py-5 text-xl font-semibold bg-purple-600 text-white rounded-2xl shadow-xl hover:bg-purple-700 transition"
        >
          Back to Home
        </a>
      </div>
    );
  }

  return (
    <div className={`min-h-screen text-white bg-gradient-to-br ${profile.background_gradient || 'from-purple-600 via-purple-700 to-pink-600'}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-32 top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -right-32 bottom-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-5 pt-16 pb-24">
        {/* Profile header */}
        <div className="text-center">
          <img
            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name || 'User')}&size=128&background=random`}
            alt={profile.display_name}
            className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white/40 shadow-2xl"
          />

          <h1 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight">
            {profile.display_name}
          </h1>

          <p className="mt-3 text-xl opacity-90 font-light max-w-xl mx-auto">
            {profile.bio || 'Helping you manifest love, abundance & soul-aligned relationships ✨'}
          </p>

          <div className="mt-6 flex justify-center gap-8 text-4xl">
            {profile.instagram && (
              <a
                href={`https://instagram.com/${profile.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 hover:text-pink-300 transition-transform"
              >
                <i className="fab fa-instagram"></i>
              </a>
            )}
            {/* Add TikTok, YouTube etc. when you have the fields */}
          </div>
        </div>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-10">
              Real Transformations
            </h2>
            <div className="space-y-8">
              {testimonials.map((t) => (
                <TestimonialBlock
                  key={t.id}
                  text={t.text}
                  author={t.author}
                  date={t.date}
                  avatar={t.avatar_url}
                  rating={t.rating || 5}
                  verified={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {products.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              Choose Your Journey
            </h2>
            <div className="space-y-8 md:space-y-10">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  {...p}
                  isPublic={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Final CTA */}
        <div className="mt-20 text-center">
          <p className="text-xl opacity-90 mb-6">
            Ready to start your transformation?
          </p>
          {profile.instagram && (
            <a
              href={`https://instagram.com/${profile.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-10 py-5 text-xl font-bold bg-white text-purple-700 rounded-2xl shadow-2xl hover:shadow-xl hover:scale-[1.03] transition-all duration-300"
            >
              Message me on Instagram →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}