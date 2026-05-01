import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  Sparkles,
  BarChart3,
  Calendar,
  Link2,
  ArrowRight,
  Star,
} from "lucide-react";
import { SparklesCore } from "@/components/ui/sparkles";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: Link2,
    title: "Bio Link Page",
    desc: "A beautiful, branded page to showcase everything you offer — courses, products, sessions.",
  },
  {
    icon: Calendar,
    title: "1:1 Booking",
    desc: "Let followers book personal sessions directly with real-time availability checking.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "See what's working — track views, clicks, and revenue from a single dashboard.",
  },
];

export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-base">
              C
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              CreatorHub
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <Link
                to="/dashboard"
                className="px-5 py-2 bg-white text-black rounded-lg font-medium text-sm hover:bg-gray-100 transition"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/sign-in"
                  className="px-5 py-2 text-sm font-medium text-white/70 hover:text-white transition hidden sm:block"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="px-5 py-2 bg-white text-black rounded-lg font-medium text-sm hover:bg-gray-100 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        {/* Sparkles background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="hero-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1.2}
            particleDensity={80}
            className="w-full h-full"
            particleColor="#FFFFFF"
            speed={0.8}
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-black pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            The all-in-one platform for creators
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95]"
          >
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Turn your audience
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              into revenue
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-6 text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
          >
            One beautiful link-in-bio page + powerful dashboard to sell courses,
            sessions, readings, and meditations — and actually see what works.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {isSignedIn ? (
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300"
              >
                Open Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/sign-up"
                  className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300"
                >
                  Start for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/sign-in"
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold border border-white/10 text-white/80 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all duration-300"
                >
                  Sign In
                </Link>
              </>
            )}
          </motion.div>

          {/* Sparkle line accent under CTA */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-16 w-full max-w-lg mx-auto h-px relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-[2px] blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px" />
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
            className="mt-8 text-sm text-white/30"
          >
            Trusted by creators, coaches, tarot readers & spiritual
            entrepreneurs
          </motion.p>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                monetize
              </span>
            </h2>
            <p className="mt-4 text-white/40 max-w-xl mx-auto">
              Stop juggling multiple tools. CreatorHub brings your storefront,
              booking, and analytics into one place.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof Section ── */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <blockquote className="text-xl md:text-2xl text-white/80 font-light leading-relaxed max-w-2xl mx-auto">
              "CreatorHub replaced 4 different tools I was paying for. My booking
              page alone brought in 3x more sessions in the first month."
            </blockquote>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white/80">
                  Ananya M.
                </p>
                <p className="text-xs text-white/40">
                  Tarot Reader & Life Coach
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to grow your creator business?
          </h2>
          <p className="text-white/40 mb-8">
            Join hundreds of creators who use CreatorHub to sell, book, and grow.
          </p>
          <Link
            to={isSignedIn ? "/dashboard" : "/sign-up"}
            className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300"
          >
            {isSignedIn ? "Open Dashboard" : "Get Started Free"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 text-center">
        <p className="text-sm text-white/30">
          © {new Date().getFullYear()} CreatorHub — Built for creators who want
          to monetize without complexity
        </p>
      </footer>
    </div>
  );
}
