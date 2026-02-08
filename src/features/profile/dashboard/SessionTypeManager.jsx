import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSupabase } from "../../../contexts/SupabaseContext";

export default function SessionTypesManager() {
  const { user } = useUser();
  const { supabaseAuth } = useSupabase();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_minutes: 30,
    price: "",
    original_price: "",
    currency: "INR",
    is_most_popular: false,
    // Do NOT include id here
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabaseAuth || !user?.id) return;
    loadSessions();
  }, [supabaseAuth, user?.id]);

  async function loadSessions() {
    setLoading(true);
    const { data, error } = await supabaseAuth
      .from("session_types")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setError("Failed to load sessions");
      console.error(error);
    } else {
      setSessions(data || []);
    }
    setLoading(false);
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim() || !formData.duration_minutes) {
      setError("Title and duration are required");
      return;
    }

    const payload = {
      user_id: user.id,
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      duration_minutes: Number(formData.duration_minutes),
      price: formData.price ? Number(formData.price) : null,
      original_price: formData.original_price
        ? Number(formData.original_price)
        : null,
      currency: formData.currency,
      is_most_popular: formData.is_most_popular,
    };

    let query;

    if (editingId) {
      // Update — include id in filter, but NOT in payload
      query = supabaseAuth
        .from("session_types")
        .update(payload)
        .eq("id", editingId);
    } else {
      // Insert — do NOT include id at all (let DB generate it)
      query = supabaseAuth.from("session_types").insert(payload);
    }
    const { error } = await query;

    if (error) {
      setError("Failed to save session type: " + error.message);
      console.error(error);
    } else {
      setFormData({
        title: "",
        description: "",
        duration_minutes: 30,
        price: "",
        original_price: "",
        currency: "INR",
        is_most_popular: false,
      });
      setEditingId(null);
      loadSessions();
    }
  };

  const handleEdit = (session) => {
    setFormData({
      title: session.title,
      duration_minutes: session.duration_minutes,
      price: session.price || "",
      original_price: session.original_price || "",
      currency: session.currency || "INR",
      description: session.description || "",
      is_most_popular: session.is_most_popular,
    });
    setEditingId(session.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this session?")) return;

    const { error } = await supabaseAuth
      .from("session_types")
      .delete()
      .eq("id", id);

    if (error) {
      setError("Failed to delete");
    } else {
      loadSessions();
    }
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      duration_minutes: 30,
      price: "",
      original_price: "",
      currency: "INR",
      description: "",
      is_most_popular: false,
    });
    setEditingId(null);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">Manage 1:1 Session Types</h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Duration (mins) *
            </label>
            <input
              type="number"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
              min="10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
              min="0"
              step="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Original Price (for strikethrough, optional)
          </label>
          <input
            type="number"
            name="original_price"
            value={formData.original_price}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            min="0"
            step="1"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_most_popular"
            checked={formData.is_most_popular}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm font-medium">Mark as "Most Popular"</label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            {editingId ? "Update" : "Add Session"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <h3 className="text-xl font-semibold mb-4">Your Sessions</h3>
      {sessions.length === 0 ? (
        <p className="text-gray-500">No sessions added yet.</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="p-4 border rounded flex justify-between items-center"
            >
              <div>
                <h4 className="font-medium">{s.title}</h4>
                <p className="text-sm text-gray-600">
                  {s.duration_minutes} min • {s.price ? `₹${s.price}` : "Free"}
                  {s.original_price && ` (was ₹${s.original_price})`}
                  {s.is_most_popular && " • Most Popular"}
                </p>
                {s.description && (
                  <p className="text-sm mt-1">{s.description}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(s)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
