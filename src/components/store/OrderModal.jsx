import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, User, Mail, MessageSquare, ShoppingBag } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function OrderModal({ product, creatorProfile, onClose }) {
  const [step, setStep] = useState("details"); // details -> confirmed
  const [formData, setFormData] = useState({ name: "", email: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currSymbol = product.currency === "USD" ? "$" : "₹";

  async function handleOrder(e) {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertErr } = await supabase.from("orders").insert({
        product_id: product.id,
        creator_id: product.user_id,
        customer_name: formData.name.trim(),
        customer_email: formData.email.trim(),
        customer_note: formData.note.trim() || null,
        amount: product.price || 0,
        currency: product.currency || "INR",
        status: "pending",
      });

      if (insertErr) throw insertErr;
      setStep("confirmed");
    } catch (err) {
      console.error("Order failed:", err);
      setError("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-lg"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-gray-600 hover:text-gray-900 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          {/* ── Order Details Form ── */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full bg-white/15">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{product.title}</h2>
                    <p className="text-white/80 text-sm mt-0.5">
                      {product.price
                        ? `${currSymbol}${product.price}`
                        : "Free"}{" "}
                      {product.original_price && (
                        <span className="line-through text-white/50 ml-1">
                          {currSymbol}{product.original_price}
                        </span>
                      )}
                      {creatorProfile?.display_name &&
                        ` · by ${creatorProfile.display_name}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Product description */}
                {product.description && (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleOrder} className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                      <User className="w-4 h-4 text-gray-400" />
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                      <Mail className="w-4 h-4 text-gray-400" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      Note <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={formData.note}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, note: e.target.value }))
                      }
                      placeholder="Any special requests or questions..."
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none text-gray-800"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-[2] py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Placing Order...
                        </span>
                      ) : product.price ? (
                        `Order · ${currSymbol}${product.price}`
                      ) : (
                        "Get it Free"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── Confirmed ── */}
          {step === "confirmed" && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-5 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <Check className="w-10 h-10 text-green-500" />
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Order Placed!
                </h3>
                <p className="text-gray-500 mb-8">
                  Your order has been submitted successfully.
                  {creatorProfile?.display_name &&
                    ` ${creatorProfile.display_name} will get in touch with you soon.`}
                </p>

                <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6 max-w-sm mx-auto">
                  <div className="flex items-start gap-3">
                    <ShoppingBag className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Product</p>
                      <p className="font-medium text-gray-800">{product.title}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Confirmation sent to</p>
                      <p className="font-medium text-gray-800">{formData.email}</p>
                    </div>
                  </div>
                  {product.price > 0 && (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-400">Amount</p>
                        <p className="font-medium text-gray-800">
                          {currSymbol}{product.price}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="w-full max-w-sm py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
