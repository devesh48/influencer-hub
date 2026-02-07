// src/features/profile/public/PublicProfilePage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';
import TestimonialBlock from '../../../components/store/TestimonialBlock';
import ProductCard from '../../../components/store/ProductCard';

export default function PublicProfilePage() {
  const { username } = useParams();

  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);

      // 1. Get profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError || !profileData) {
        setError('Profile not found');
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // 2. Get products
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', profileData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      setProducts(prodData || []);

      // 3. Get testimonials
      const { data: testData } = await supabase
        .from('testimonials')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false });

      setTestimonials(testData || []);

      setLoading(false);
    }

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h1 className="text-6xl font-bold text-purple-600 mb-6">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Creator not found</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          The profile you're looking for doesn't exist or may have been removed.
        </p>
        <a
          href="/"
          className="px-8 py-4 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700"
        >
          Back to Home
        </a>
      </div>
    );
  }

  return (
    <div className={`min-h-screen text-white bg-gradient-to-br ${profile.background_gradient || 'from-purple-600 to-pink-600'}`}>
      {/* ... rest of your beautiful JSX using profile, products, testimonials ... */}
      {/* Replace mock values with real ones, e.g. */}
      <h1>{profile.display_name}</h1>
      <p>{profile.bio}</p>
      {/* products.map(...) */}
      {/* testimonials.map(...) */}
    </div>
  );
}