import { useParams } from 'react-router-dom';
import ProductCard from '../../../components/store/ProductCard';
import TestimonialBlock from '../../../components/store/TestimonialBlock';
// import mock data
import { products, testimonials } from '../../../data/mockData';

export default function PublicProfilePage() {
  const { username } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 text-white">
      <div className="max-w-md mx-auto px-5 pt-16 pb-20">
        {/* Avatar + name + bio */}
        <div className="text-center">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120"
            alt="avatar"
            className="w-28 h-28 rounded-full mx-auto border-4 border-white/40 shadow-2xl object-cover"
          />
          <h1 className="mt-5 text-3xl font-bold">{username || 'Tanvi Rateria'}</h1>
          <p className="mt-2 opacity-90">Manifest Love & Commitment with {username}</p>
        </div>

        {/* Testimonials */}
        <div className="mt-10 space-y-6">
          {testimonials.map((t, i) => (
            <TestimonialBlock key={i} {...t} />
          ))}
        </div>

        {/* Products / Services */}
        <div className="mt-10 space-y-6">
          {products.map((p) => (
            <ProductCard key={p.id} {...p} isPublic />
          ))}
        </div>
      </div>
    </div>
  );
}