// src/components/store/SessionBookingCards.jsx
import { useState, useEffect } from "react";
import { useSupabase } from "../../contexts/SupabaseContext";

export default function SessionBookingCards({ profileId }) {
  const { supabaseAuth } = useSupabase();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseAuth || !profileId) return;

    async function loadSessions() {
      setLoading(true);
      const { data, error } = await supabaseAuth
        .from("session_types")
        .select("*")
        .eq("user_id", profileId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load session types:", error);
      } else {
        setSessions(data || []);
      }
      setLoading(false);
    }

    loadSessions();
  }, [supabaseAuth, profileId]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading sessions...</div>;
  }

  if (sessions.length === 0) {
    return null; // hide section if no sessions
  }

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-center mb-10 text-white">
        Book a Personal Session
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300"
          >
            {/* Header with title & badge */}
            <div className="p-6 pb-4 border-b border-white/10">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold text-white">
                  {session.title}
                </h3>
                {session.is_most_popular && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow">
                    Most Popular
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-center gap-4 text-white/80">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {session.duration_minutes} mins
                </div>

                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Link Meeting
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="p-6 pt-4">
              <div className="flex items-center gap-3">
                {session.original_price && (
                  <span className="text-xl text-white/60 line-through">
                    ₹{session.original_price}
                  </span>
                )}
                <span className="text-3xl font-bold text-white">
                  ₹{session.price || "Free"}
                </span>
              </div>
            </div>

            {/* Photo + Description */}
            <div className="px-6 pb-6">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400" // replace with real creator photo or dynamic
                alt="Creator"
                className="w-full h-48 object-cover rounded-xl mb-4"
              />

              <p className="text-white/90 text-sm leading-relaxed">
                {session.description ||
                  "This is a discovery call, NOT a consultation. It's just to talk, understand your situation and suggest the best advice..."}
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 bg-black/20 border-t border-white/10">
              <button
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-lg hover:shadow-xl"
              >
                Book Now
              </button>

              <div className="mt-4 text-center">
                <a href="#" className="text-white/70 text-sm hover:text-white flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367 2.684m-5.367-2.684l-6.632-3.316" />
                  </svg>
                  Share this session
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}