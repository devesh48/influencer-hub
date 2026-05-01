import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSupabase } from "../../../contexts/SupabaseContext";
import { XMarkIcon } from "@heroicons/react/24/outline";
import GoogleCalendarConnect from "../dashboard/GoogleCalenderConnect";

export default function PublicProfileSettings() {
  const { user } = useUser();
  const { supabaseAuth } = useSupabase();

  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    instagram: "",
    avatar_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Google Calendar connection status
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  // Load current profile
  useEffect(() => {
    if (!supabaseAuth || !user) return;

    async function loadProfile() {
      setLoading(true);
      try {
        const { data, error } = await supabaseAuth
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setFormData({
            display_name: data.display_name || user.firstName || "",
            bio: data.bio || "",
            instagram: data.instagram || "",
            avatar_url: data.avatar_url || user.imageUrl || "",
          });
          setPreviewUrl(data.avatar_url || user.imageUrl || "");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [supabaseAuth, user]);

  // Check Google Calendar connection
  useEffect(() => {
    async function checkGoogleConnection() {
      if (!supabaseAuth || !user?.id) return;

      const { data, error } = await supabaseAuth
        .from("google_tokens")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Check connection error:", error);
      } else {
        setIsGoogleConnected(!!data);
      }
      setCheckingConnection(false);
    }

    checkGoogleConnection();
  }, [supabaseAuth, user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Avatar selection → compress → preview → upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setUploadingAvatar(true);
    setUploadProgress(0);
    setError("");

    try {
      const compressedFile = await compressAndResizeImage(file, 400, 400, 0.7);

      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(compressedFile);

      const fileExt = compressedFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const bucketName =
        import.meta.env.VITE_SUPABASE_AVATARS_BUCKET || "creatorHub-bucket";

      const { error: uploadError } = await supabaseAuth.storage
        .from(bucketName)
        .upload(filePath, compressedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabaseAuth.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabaseAuth
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setFormData((prev) => ({ ...prev, avatar_url: publicUrl }));
      setPreviewUrl(publicUrl);
      setSuccess("Avatar uploaded & optimized!");
      setShowAvatarModal(false);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setError(err.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
      setUploadProgress(0);
    }
  };

  const compressAndResizeImage = (
    file,
    maxWidth = 400,
    maxHeight = 400,
    quality = 0.7,
  ) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Compression failed"));
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality,
        );
      };

      img.onerror = reject;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const { error } = await supabaseAuth
        .from("profiles")
        .update({
          display_name: formData.display_name.trim(),
          bio: formData.bio.trim(),
          instagram: formData.instagram.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Username for public link
  const [username, setUsername] = useState("");
  useEffect(() => {
    if (!supabaseAuth || !user) return;
    supabaseAuth
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.username) setUsername(data.username);
      });
  }, [supabaseAuth, user]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Public Profile</h1>
        <p className="text-gray-500 mt-1">
          Customize how your page looks to visitors
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-5 gap-8">
        {/* ── Form Column ── */}
        <div className="md:col-span-3">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Profile Picture
              </h3>
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <img
                    src={
                      previewUrl ||
                      formData.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.display_name || "User")}&size=128&background=7c3aed&color=fff`
                    }
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAvatarModal(true)}
                    className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAvatarModal(true)}
                    className="text-sm font-medium text-purple-600 hover:text-purple-700 transition"
                  >
                    Change photo
                  </button>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG or WebP. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Basic Info
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  placeholder="Your public name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Tell visitors about yourself..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none text-gray-800"
                />
                <p className="mt-1 text-xs text-gray-400">
                  {formData.bio.length}/200 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Instagram
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 text-sm">@</span>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="yourusername"
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Google Calendar */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-1">
                Google Calendar
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Required for 1:1 session bookings
              </p>

              {checkingConnection ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-purple-500 rounded-full animate-spin" />
                  Checking connection...
                </div>
              ) : isGoogleConnected ? (
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Connected
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm("Disconnect Google Calendar?")) {
                        await supabaseAuth
                          .from("google_tokens")
                          .delete()
                          .eq("user_id", user.id);
                        setIsGoogleConnected(false);
                      }
                    }}
                    className="text-sm text-red-500 hover:text-red-700 font-medium transition"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <GoogleCalendarConnect />
              )}
            </div>

            {/* Public Link */}
            {username && (
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-900">Your public page</p>
                    <p className="text-sm text-purple-600 mt-0.5 font-mono">
                      {window.location.origin}/{username}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/${username}`);
                      setSuccess("Link copied!");
                    }}
                    className="px-4 py-2 text-sm font-medium text-purple-700 bg-white border border-purple-200 rounded-lg hover:bg-purple-100 transition"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            )}

            {/* Save */}
            <button
              type="submit"
              disabled={saving}
              className={`w-full py-3.5 px-6 text-white font-semibold rounded-xl transition-all ${
                saving
                  ? "bg-purple-300 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg active:scale-[0.98]"
              }`}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </div>

        {/* ── Live Preview Column ── */}
        <div className="md:col-span-2">
          <div className="sticky top-24">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Preview
            </h3>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              {/* Phone frame */}
              <div className="bg-black text-white p-6 min-h-[420px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                {/* Simulated sparkle dots */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-8 left-6 w-1 h-1 bg-white/30 rounded-full" />
                  <div className="absolute top-16 right-10 w-0.5 h-0.5 bg-white/20 rounded-full" />
                  <div className="absolute top-32 left-16 w-0.5 h-0.5 bg-white/25 rounded-full" />
                  <div className="absolute bottom-20 right-8 w-1 h-1 bg-white/20 rounded-full" />
                  <div className="absolute bottom-40 left-10 w-0.5 h-0.5 bg-white/15 rounded-full" />
                  <div className="absolute top-1/2 right-16 w-0.5 h-0.5 bg-white/20 rounded-full" />
                </div>

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-black pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-purple-600/15 rounded-full blur-[60px] pointer-events-none" />

                <div className="relative z-10">
                  {/* Avatar */}
                  <div className="relative inline-block mb-4">
                    <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-md opacity-50" />
                    <img
                      src={
                        previewUrl ||
                        formData.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.display_name || "User")}&size=128&background=7c3aed&color=fff`
                      }
                      alt="Preview"
                      className="relative w-20 h-20 rounded-full border-2 border-white/20 shadow-xl object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-black" />
                  </div>

                  {/* Name */}
                  <h2 className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                    {formData.display_name || "Your Name"}
                  </h2>

                  {/* Bio */}
                  <p className="mt-2 text-sm text-white/50 max-w-[220px] leading-relaxed">
                    {formData.bio || "Your bio will appear here..."}
                  </p>

                  {/* Instagram */}
                  {formData.instagram && (
                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs text-white/60">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      @{formData.instagram}
                    </div>
                  )}

                  {/* Sparkle divider */}
                  <div className="mt-5 w-24 mx-auto h-px relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px" />
                  </div>

                  {/* Placeholder cards */}
                  <div className="mt-5 space-y-2 w-full max-w-[220px]">
                    <div className="h-8 rounded-lg bg-white/[0.04] border border-white/[0.06]" />
                    <div className="h-8 rounded-lg bg-white/[0.04] border border-white/[0.06]" />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-3">
              This is how visitors see your page
            </p>
          </div>
        </div>
      </div>

      {/* ── Avatar Upload Modal ── */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Upload Profile Picture</h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  uploadingAvatar
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-400 hover:bg-purple-50/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleAvatarChange({ target: { files: [file] } });
                }}
              >
                <div className="mx-auto w-16 h-16 mb-4 text-purple-400">
                  {uploadingAvatar ? (
                    <svg className="animate-spin" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    </svg>
                  ) : (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                </div>

                <p className="text-base font-medium text-gray-800 mb-1">
                  {uploadingAvatar ? "Uploading..." : "Drag & drop your image"}
                </p>
                <p className="text-sm text-gray-400">
                  or <span className="text-purple-600 font-medium">browse files</span>
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  PNG, JPG, WebP &middot; Max 5MB
                </p>

                {uploadingAvatar && (
                  <div className="mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">{uploadProgress}%</p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="px-5 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-100 transition text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                disabled={uploadingAvatar}
                className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition ${
                  uploadingAvatar ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
