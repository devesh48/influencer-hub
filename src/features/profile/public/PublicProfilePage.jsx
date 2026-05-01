import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { supabase } from "../../../lib/supabaseClient";
import { SparklesCore } from "../../../components/ui/sparkles";
import TestimonialBlock from "../../../components/store/TestimonialBlock";
import SessionBookingCards from "../../../components/store/SessionBookingCards";
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

// Helper: human-readable time left
function getTimeLeft(expiresAt) {
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h left`;
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

const testimonials = [
  {
    author: {
      name: "Emma Thompson",
      handle: "@emmaai",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
    },
    text: "Using this AI platform has transformed how we handle data analysis. The speed and accuracy are unprecedented.",
    href: "https://twitter.com/emmaai"
  },
  {
    author: {
      name: "David Park",
      handle: "@davidtech",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    text: "The API integration is flawless. We've reduced our development time by 60% since implementing this solution.",
    href: "https://twitter.com/davidtech"
  },
  {
    author: {
      name: "Sofia Rodriguez",
      handle: "@sofiaml",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    text: "Finally, an AI tool that actually understands context! The accuracy in natural language processing is impressive."
  }
];


export default function PublicProfilePage() {
  const { username } = useParams();

  const [profile, setProfile] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfileData() {
      setPageLoading(true);
      setPageError(null);

      try {
        const { data: profileData, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username.toLowerCase())
          .single();

        if (profileErr) throw profileErr;
        if (!profileData) throw new Error("Profile not found");

        if (!mounted) return;
        setProfile(profileData);

        const now = new Date().toISOString();

        const [promoResult, testResult] = await Promise.all([
          supabase
            .from("promotions")
            .select("*")
            .eq("user_id", profileData.id)
            .eq("is_active", true)
            .or(`display_at.is.null,display_at.lte.${now}`)
            .or(`expires_at.is.null,expires_at.gt.${now}`)
            .order("created_at", { ascending: false }),
          supabase
            .from("testimonials")
            .select("*")
            .eq("user_id", profileData.id)
            .order("created_at", { ascending: false }),
        ]);

        if (promoResult.error) throw promoResult.error;
        if (testResult.error) throw testResult.error;

        if (mounted) {
          // Client-side filter for correctness (Supabase OR filters can be tricky)
          const validPromos = (promoResult.data || []).filter((p) => {
            if (p.display_at && new Date(p.display_at) > new Date()) return false;
            if (p.expires_at && new Date(p.expires_at) < new Date()) return false;
            return true;
          });
          setPromotions(validPromos);
          setTestimonials(testResult.data || []);
        }
      } catch (err) {
        console.error("Failed to load public profile:", err);
        if (mounted) setPageError(err.message || "Failed to load creator profile");
      } finally {
        if (mounted) setPageLoading(false);
      }
    }

    loadProfileData();
    return () => { mounted = false; };
  }, [username]);

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (pageError || !profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 mb-6 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-5xl font-black text-white mb-3">404</h1>
        <h2 className="text-xl font-semibold text-white/70 mb-2">Creator not found</h2>
        <p className="text-white/40 mb-8 max-w-sm">
          The profile you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* ── Sparkles Background ── */}
      <div className="fixed inset-0 w-full h-full">
        <SparklesCore
          id="profile-sparkles"
          background="transparent"
          minSize={0.3}
          maxSize={1}
          particleDensity={50}
          className="w-full h-full"
          particleColor="#FFFFFF"
          speed={0.6}
        />
      </div>

      {/* Gradient overlays */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-black pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-pink-600/8 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-2xl mx-auto px-5 pt-12 pb-24">
        {/* ── Profile Header ── */}
        <motion.header
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="text-center pt-6 pb-8"
        >
          <div className="relative inline-block">
            <div className="absolute -inset-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-md opacity-60" />
            <img
              src={
                profile.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name || "User")}&size=160&background=7c3aed&color=fff&bold=true`
              }
              alt={profile.display_name}
              className="relative w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-[3px] border-white/20 shadow-2xl shadow-purple-500/20"
            />
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 rounded-full border-[3px] border-black shadow" />
          </div>

          <h1 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            {profile.display_name}
          </h1>

          {profile.bio && (
            <p className="mt-3 text-base md:text-lg text-white/50 font-light max-w-md mx-auto leading-relaxed">
              {profile.bio}
            </p>
          )}

          <div className="mt-5 flex justify-center gap-3">
            {profile.instagram && (
              <a
                href={`https://instagram.com/${profile.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] text-sm font-medium hover:bg-white/[0.12] hover:border-white/[0.15] transition-all duration-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                @{profile.instagram}
              </a>
            )}
          </div>
        </motion.header>

        {/* Sparkle divider */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="w-full max-w-xs mx-auto h-px relative my-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-[2px] blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px" />
        </motion.div>

        {/* ── Quote of the Day ── */}
        {profile.quote_text && (
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={1.5}
            className="my-8"
          >
            <div className="relative bg-white/[0.04] border border-white/[0.08] rounded-2xl px-6 py-5 text-center overflow-hidden">
              {/* Subtle glow */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[60px] bg-purple-500/10 rounded-full blur-[40px]" />
              </div>
              <div className="relative">
                <svg className="w-6 h-6 text-purple-400/50 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-white/80 italic text-base md:text-lg leading-relaxed max-w-md mx-auto">
                  {profile.quote_text}
                </p>
                {profile.quote_author && (
                  <p className="mt-3 text-sm text-white/40">— {profile.quote_author}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Active Promotions ── */}
        {promotions.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] text-sm text-white/60 mb-4 backdrop-blur-sm">
                <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                Special Offers
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">
                Exclusive{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Deals
                </span>
              </h2>
            </div>

            <div className="space-y-5">
              {promotions.map((promo, i) => {
                const hasDiscount = promo.original_price && promo.offer_price && promo.original_price > promo.offer_price;
                const discountPct = hasDiscount
                  ? Math.round(((promo.original_price - promo.offer_price) / promo.original_price) * 100)
                  : 0;
                const timeLeft = promo.expires_at ? getTimeLeft(promo.expires_at) : null;

                return (
                  <motion.div
                    key={promo.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="group relative bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.07] hover:border-white/[0.12] hover:-translate-y-0.5 overflow-hidden"
                  >
                    {/* Glow */}
                    <div className="absolute top-0 right-0 w-[200px] h-[100px] bg-purple-500/5 rounded-full blur-[60px] pointer-events-none" />

                    <div className="relative">
                      {/* Badges row */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {promo.discount_label && (
                          <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg shadow-purple-500/20">
                            {promo.discount_label}
                          </span>
                        )}
                        {hasDiscount && !promo.discount_label && (
                          <span className="px-3 py-1 text-xs font-bold bg-green-400/20 text-green-400 rounded-full border border-green-400/30">
                            {discountPct}% OFF
                          </span>
                        )}
                        {timeLeft && (
                          <span className="px-3 py-1 text-xs font-medium bg-yellow-400/10 text-yellow-400 rounded-full border border-yellow-400/20 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {timeLeft}
                          </span>
                        )}
                      </div>

                      {/* Title & price */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-white leading-snug">
                            {promo.title}
                          </h3>
                          {promo.description && (
                            <p className="mt-2 text-sm text-white/45 leading-relaxed">
                              {promo.description}
                            </p>
                          )}
                        </div>

                        {(promo.offer_price || promo.original_price) && (
                          <div className="text-right shrink-0">
                            {promo.original_price && (
                              <span className="text-sm text-white/30 line-through block">
                                ₹{promo.original_price}
                              </span>
                            )}
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                              {promo.offer_price ? `₹${promo.offer_price}` : "Free"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      {promo.cta_text && (
                        <div className="mt-5">
                          {promo.cta_link ? (
                            <a
                              href={promo.cta_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/10 hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]"
                            >
                              {promo.cta_text}
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.08] text-white text-sm font-semibold rounded-xl border border-white/[0.1]">
                              {promo.cta_text}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ── Session Booking ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
          <SessionBookingCards profileId={profile.id} creatorProfile={profile} />
        </motion.div>

        {/* ── Testimonials ── */}
        {testimonials.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-20"
          >
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] text-sm text-white/60 mb-4 backdrop-blur-sm">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Reviews
              </span>
              <h2 className="text-3xl md:text-4xl font-bold">
                What People{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Say</span>
              </h2>
            </div>
            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <TestimonialBlock
                    text={t.text} author={t.author} date={t.date}
                    avatar={t.avatar_url} rating={t.rating || 5} verified={true}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Footer CTA ── */}
        <motion.footer
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24 text-center"
        >
          <div className="relative bg-white/[0.03] backdrop-blur-lg border border-white/[0.06] rounded-2xl p-8 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-purple-600/10 rounded-full blur-[80px]" />
            </div>
            <div className="relative">
              <p className="text-lg text-white/60 mb-5">Ready to start your journey?</p>
              {profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-8 py-4 text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300"
                >
                  Message on Instagram
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              )}
            </div>
          </div>
          <p className="mt-8 text-sm text-white/20">Powered by CreatorHub</p>
        </motion.footer>
      </div>
    </div>
  );
}
