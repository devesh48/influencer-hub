import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSupabase } from "../../../contexts/SupabaseContext";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// ─── Date helpers ───
function toLocalDatetime(d) {
  if (!d) return "";
  const dt = new Date(d);
  const off = dt.getTimezoneOffset();
  const local = new Date(dt.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

// ─── Promotion Form Modal ───
function PromotionFormModal({ promo, onSave, onClose, saving }) {
  const isEdit = !!promo;

  const [form, setForm] = useState(() => ({
    title: promo?.title || "",
    description: promo?.description || "",
    discount_label: promo?.discount_label || "",
    original_price: promo?.original_price != null ? String(promo.original_price) : "",
    offer_price: promo?.offer_price != null ? String(promo.offer_price) : "",
    cta_text: promo?.cta_text || "Grab Offer",
    cta_link: promo?.cta_link || "",
    display_at: toLocalDatetime(promo?.display_at) || "",
    expires_at: toLocalDatetime(promo?.expires_at) || "",
    is_active: promo?.is_active !== false,
  }));
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (form.original_price && isNaN(Number(form.original_price)))
      errs.original_price = "Invalid price";
    if (form.offer_price && isNaN(Number(form.offer_price)))
      errs.offer_price = "Invalid price";
    if (form.expires_at && form.display_at && new Date(form.expires_at) <= new Date(form.display_at))
      errs.expires_at = "Expiry must be after display time";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      title: form.title.trim(),
      description: form.description.trim() || null,
      discount_label: form.discount_label.trim() || null,
      original_price: form.original_price ? Number(form.original_price) : null,
      offer_price: form.offer_price ? Number(form.offer_price) : null,
      cta_text: form.cta_text.trim() || "Grab Offer",
      cta_link: form.cta_link.trim() || null,
      display_at: form.display_at ? new Date(form.display_at).toISOString() : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: form.is_active,
    });
  };

  const hasDiscount =
    form.original_price && form.offer_price &&
    Number(form.original_price) > Number(form.offer_price);
  const discountPct = hasDiscount
    ? Math.round(((Number(form.original_price) - Number(form.offer_price)) / Number(form.original_price)) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{isEdit ? "Edit Promotion" : "Create Promotion"}</h2>
            <p className="text-sm text-gray-400">{isEdit ? "Update offer details" : "Create a new offer for your audience"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Offer Title *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g., New Year Special — 50% Off All Readings" className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-800 ${errors.title ? "border-red-300" : "border-gray-200"}`} />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Tell your audience what they're getting..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none text-gray-800" />
          </div>

          {/* Discount Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Badge <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" name="discount_label" value={form.discount_label} onChange={handleChange} placeholder="e.g., 50% OFF, BOGO, LIMITED" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-800" />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Original Price</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 text-sm">₹</span>
                <input type="text" name="original_price" value={form.original_price} onChange={handleChange} placeholder="Optional" className={`w-full pl-9 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-800 ${errors.original_price ? "border-red-300" : "border-gray-200"}`} />
              </div>
              {errors.original_price && <p className="mt-1 text-xs text-red-500">{errors.original_price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Offer Price</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 text-sm">₹</span>
                <input type="text" name="offer_price" value={form.offer_price} onChange={handleChange} placeholder="Leave empty for free" className={`w-full pl-9 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-800 ${errors.offer_price ? "border-red-300" : "border-gray-200"}`} />
              </div>
              {errors.offer_price && <p className="mt-1 text-xs text-red-500">{errors.offer_price}</p>}
              {hasDiscount && <p className="mt-1 text-xs text-green-600 font-medium">{discountPct}% discount</p>}
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Button Text</label>
              <input type="text" name="cta_text" value={form.cta_text} onChange={handleChange} placeholder="Grab Offer" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Button Link <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="text" name="cta_link" value={form.cta_link} onChange={handleChange} placeholder="https://..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-800" />
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Display From</label>
              <input type="datetime-local" name="display_at" value={form.display_at} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-800" />
              <p className="mt-1 text-xs text-gray-400">Leave empty to show immediately</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Expires At</label>
              <input type="datetime-local" name="expires_at" value={form.expires_at} onChange={handleChange} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-800 ${errors.expires_at ? "border-red-300" : "border-gray-200"}`} />
              {errors.expires_at && <p className="mt-1 text-xs text-red-500">{errors.expires_at}</p>}
              <p className="mt-1 text-xs text-gray-400">Leave empty for no expiry</p>
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Published</p>
              <p className="text-xs text-gray-400">Visible on your public page</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={saving} className="flex-[2] py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : isEdit ? "Update Promotion" : "Create Promotion"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Quote Form Modal ───
function QuoteFormModal({ quote, onSave, onClose, saving }) {
  const [form, setForm] = useState(() => ({
    quote_text: quote?.quote_text || "",
    quote_author: quote?.quote_author || "",
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.quote_text.trim()) return;
    onSave({
      quote_text: form.quote_text.trim(),
      quote_author: form.quote_author.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Quote of the Day</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Quote *</label>
            <textarea name="quote_text" value={form.quote_text} onChange={(e) => setForm((p) => ({ ...p, quote_text: e.target.value }))} rows={4} placeholder="The universe is not outside of you. Look inside yourself; everything that you want, you already are." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none text-gray-800" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Author <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" value={form.quote_author} onChange={(e) => setForm((p) => ({ ...p, quote_author: e.target.value }))} placeholder="e.g., Rumi" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-800" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={saving} className="flex-[2] py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-60">
              {saving ? "Saving..." : "Save Quote"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Status helpers ───
function getPromoStatus(promo) {
  const now = new Date();
  if (!promo.is_active) return { label: "Draft", color: "bg-gray-100 text-gray-500" };
  if (promo.expires_at && new Date(promo.expires_at) < now)
    return { label: "Expired", color: "bg-red-50 text-red-600" };
  if (promo.display_at && new Date(promo.display_at) > now)
    return { label: "Scheduled", color: "bg-blue-50 text-blue-600" };
  return { label: "Live", color: "bg-green-50 text-green-700" };
}

function formatDt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

// ─── Main Page ───
export default function StorePage() {
  const { user } = useUser();
  const { supabaseAuth } = useSupabase();

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [saving, setSaving] = useState(false);

  const [quoteText, setQuoteText] = useState("");
  const [quoteAuthor, setQuoteAuthor] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [savingQuote, setSavingQuote] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState("all");

  // Load promotions + quote
  const loadData = useCallback(async () => {
    if (!supabaseAuth || !user?.id) return;
    setLoading(true);
    try {
      const [promoRes, profileRes] = await Promise.all([
        supabaseAuth
          .from("promotions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabaseAuth
          .from("profiles")
          .select("quote_text, quote_author")
          .eq("id", user.id)
          .single(),
      ]);

      if (promoRes.error) throw promoRes.error;
      setPromotions(promoRes.data || []);

      if (profileRes.data) {
        setQuoteText(profileRes.data.quote_text || "");
        setQuoteAuthor(profileRes.data.quote_author || "");
      }
    } catch (err) {
      console.error("Load error:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [supabaseAuth, user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-clear alerts
  useEffect(() => {
    if (success || error) {
      const t = setTimeout(() => { setSuccess(""); setError(""); }, 4000);
      return () => clearTimeout(t);
    }
  }, [success, error]);

  // ── Promotion CRUD ──
  const handleSavePromo = async (payload) => {
    setSaving(true);
    setError("");
    try {
      if (editingPromo) {
        const { error: err } = await supabaseAuth
          .from("promotions")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", editingPromo.id);
        if (err) throw err;
        setSuccess("Promotion updated!");
      } else {
        const { error: err } = await supabaseAuth
          .from("promotions")
          .insert({ ...payload, user_id: user.id });
        if (err) throw err;
        setSuccess("Promotion created!");
      }
      setShowPromoModal(false);
      setEditingPromo(null);
      loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save promotion");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePromo = async (promo) => {
    if (!confirm(`Delete "${promo.title}"?`)) return;
    try {
      const { error: err } = await supabaseAuth.from("promotions").delete().eq("id", promo.id);
      if (err) throw err;
      setPromotions((p) => p.filter((x) => x.id !== promo.id));
      setSuccess("Promotion deleted");
    } catch (err) {
      console.error(err);
      setError("Failed to delete");
    }
  };

  const handleTogglePromo = async (promo) => {
    try {
      const { error: err } = await supabaseAuth
        .from("promotions")
        .update({ is_active: !promo.is_active })
        .eq("id", promo.id);
      if (err) throw err;
      setPromotions((p) => p.map((x) => (x.id === promo.id ? { ...x, is_active: !x.is_active } : x)));
    } catch (err) {
      console.error(err);
      setError("Failed to update");
    }
  };

  // ── Quote save ──
  const handleSaveQuote = async (payload) => {
    setSavingQuote(true);
    try {
      const { error: err } = await supabaseAuth
        .from("profiles")
        .update({
          quote_text: payload.quote_text,
          quote_author: payload.quote_author,
        })
        .eq("id", user.id);
      if (err) throw err;
      setQuoteText(payload.quote_text);
      setQuoteAuthor(payload.quote_author || "");
      setShowQuoteModal(false);
      setSuccess("Quote updated!");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save quote");
    } finally {
      setSavingQuote(false);
    }
  };

  const handleRemoveQuote = async () => {
    if (!confirm("Remove the quote from your public page?")) return;
    try {
      const { error: err } = await supabaseAuth
        .from("profiles")
        .update({ quote_text: null, quote_author: null })
        .eq("id", user.id);
      if (err) throw err;
      setQuoteText("");
      setQuoteAuthor("");
      setSuccess("Quote removed");
    } catch (err) {
      console.error(err);
      setError("Failed to remove quote");
    }
  };

  // Filter
  const now = new Date();
  const filtered = promotions.filter((p) => {
    if (tab === "live") {
      return p.is_active && (!p.display_at || new Date(p.display_at) <= now) && (!p.expires_at || new Date(p.expires_at) > now);
    }
    if (tab === "scheduled") return p.is_active && p.display_at && new Date(p.display_at) > now;
    if (tab === "expired") return p.expires_at && new Date(p.expires_at) < now;
    if (tab === "draft") return !p.is_active;
    return true;
  });

  const liveCount = promotions.filter((p) => p.is_active && (!p.display_at || new Date(p.display_at) <= now) && (!p.expires_at || new Date(p.expires_at) > now)).length;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offers & Promotions</h1>
          <p className="text-gray-500 text-sm mt-1">Create time-limited offers and manage your quote of the day</p>
        </div>
        <button
          onClick={() => { setEditingPromo(null); setShowPromoModal(true); }}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Promotion
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {success}
        </div>
      )}

      {/* ── Quote of the Day Card ── */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-6 mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-1">Quote of the Day</h3>
              {quoteText ? (
                <>
                  <p className="text-gray-700 italic leading-relaxed">&ldquo;{quoteText}&rdquo;</p>
                  {quoteAuthor && <p className="text-sm text-gray-500 mt-1">— {quoteAuthor}</p>}
                </>
              ) : (
                <p className="text-gray-400 text-sm">No quote set. Add an inspiring quote for your visitors.</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowQuoteModal(true)}
              className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-white border border-purple-200 hover:bg-purple-50 rounded-lg transition"
            >
              {quoteText ? "Edit" : "Add Quote"}
            </button>
            {quoteText && (
              <button onClick={handleRemoveQuote} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition">
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{promotions.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400">Live Now</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{liveCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400">Scheduled</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{promotions.filter((p) => p.is_active && p.display_at && new Date(p.display_at) > now).length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400">Expired</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">{promotions.filter((p) => p.expires_at && new Date(p.expires_at) < now).length}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit overflow-x-auto">
        {[
          { key: "all", label: "All" },
          { key: "live", label: "Live" },
          { key: "scheduled", label: "Scheduled" },
          { key: "expired", label: "Expired" },
          { key: "draft", label: "Drafts" },
        ].map((t) => (
          <button
            key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Promotions List ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto bg-purple-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {tab === "all" ? "No promotions yet" : `No ${tab} promotions`}
          </h3>
          <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
            {tab === "all" ? "Create your first offer with discounts, scheduling, and more." : "Try changing the filter."}
          </p>
          {tab === "all" && (
            <button onClick={() => { setEditingPromo(null); setShowPromoModal(true); }} className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Create First Promotion
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((promo) => {
            const status = getPromoStatus(promo);
            return (
              <div key={promo.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-all hover:shadow-md ${promo.is_active ? "border-gray-100" : "border-gray-100 opacity-70"}`}>
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{promo.title}</h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}>{status.label}</span>
                          {promo.discount_label && (
                            <span className="px-2 py-0.5 text-xs font-bold bg-green-50 text-green-700 rounded-full">{promo.discount_label}</span>
                          )}
                        </div>
                        {promo.description && (
                          <p className="mt-1 text-sm text-gray-500 line-clamp-1">{promo.description}</p>
                        )}
                      </div>

                      {/* Price */}
                      {(promo.offer_price || promo.original_price) && (
                        <div className="text-right shrink-0">
                          {promo.original_price && (
                            <span className="text-sm text-gray-400 line-through block">₹{promo.original_price}</span>
                          )}
                          <span className="text-lg font-bold text-gray-900">
                            {promo.offer_price ? `₹${promo.offer_price}` : "Free"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Schedule info */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        From: {formatDt(promo.display_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Expires: {formatDt(promo.expires_at)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => { setEditingPromo(promo); setShowPromoModal(true); }} className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition">Edit</button>
                      <button onClick={() => handleTogglePromo(promo)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${promo.is_active ? "text-yellow-700 bg-yellow-50 hover:bg-yellow-100" : "text-green-700 bg-green-50 hover:bg-green-100"}`}>
                        {promo.is_active ? "Unpublish" : "Publish"}
                      </button>
                      <button onClick={() => handleDeletePromo(promo)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showPromoModal && (
        <PromotionFormModal
          promo={editingPromo}
          onSave={handleSavePromo}
          onClose={() => { setShowPromoModal(false); setEditingPromo(null); }}
          saving={saving}
        />
      )}
      {showQuoteModal && (
        <QuoteFormModal
          quote={{ quote_text: quoteText, quote_author: quoteAuthor }}
          onSave={handleSaveQuote}
          onClose={() => setShowQuoteModal(false)}
          saving={savingQuote}
        />
      )}
    </div>
  );
}
