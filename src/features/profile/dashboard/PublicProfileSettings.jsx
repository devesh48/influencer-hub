// src/features/profile/dashboard/PublicProfileSettings.tsx
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSupabase } from "../../../contexts/SupabaseContext";
import { XMarkIcon } from "@heroicons/react/24/outline";
import GoogleCalendarConnect from "../dashboard/GoogleCalenderConnect";  // ← Import here

export default function PublicProfileSettings() {
  const { user } = useUser();
  const { supabaseAuth } = useSupabase();

  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    instagram: "",
    avatar_url: "",
    background_gradient: "from-purple-600 via-purple-700 to-pink-600",
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
            background_gradient:
              data.background_gradient ||
              "from-purple-600 via-purple-700 to-pink-600",
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

    // Validate
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
      // Compress & resize (client-side)
      const compressedFile = await compressAndResizeImage(file, 400, 400, 0.7);

      // Local preview
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(compressedFile);

      // Upload
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

      // Get public URL
      const { data: urlData } = supabaseAuth.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Save to profiles
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

  // Compress & resize helper
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
          background_gradient: formData.background_gradient.trim(),
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

  if (loading) {
    return <div className="p-8 text-center">Loading your profile...</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Public Profile Settings</h1>
      <p className="text-gray-600 mb-10">
        Customize how your public page looks to visitors.
      </p>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Form */}
        <div className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar with Pencil Icon */}
            <div className="relative w-32 h-32 mx-auto mb-8 group">
              <img
                src={
                  previewUrl ||
                  formData.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.display_name || "User")}&size=128`
                }
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-gray-200 shadow-xl"
              />

              {/* Pencil button */}
              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-0 right-0 bg-purple-600 text-white p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-purple-700"
                title="Change avatar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio / Tagline
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram Handle
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">@</span>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Background Gradient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Gradient
              </label>
              <input
                type="text"
                name="background_gradient"
                value={formData.background_gradient}
                onChange={handleChange}
                placeholder="from-purple-600 via-purple-700 to-pink-600"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Example: from-indigo-600 to-purple-600
              </p>
            </div>

            {/* Google Calendar Connection Status */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">
                1:1 Session Booking (Google Calendar)
              </h3>

              {checkingConnection ? (
                <div className="text-gray-500">Checking connection...</div>
              ) : isGoogleConnected ? (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Google Calendar Connected
                  </span>
                  <button
                    onClick={async () => {
                      if (confirm("Disconnect Google Calendar?")) {
                        await supabaseAuth
                          .from("google_tokens")
                          .delete()
                          .eq("user_id", user.id);
                        setIsGoogleConnected(false);
                      }
                    }}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    Connect your Google Calendar to let followers book 1:1 sessions directly.
                  </p>
                  {/* Import and use the component here */}
                  <GoogleCalendarConnect />
                </div>
              )}
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-4 px-6 text-white font-medium rounded-xl transition-all ${
                  saving
                    ? "bg-purple-300 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg"
                }`}
              >
                {saving ? "Saving..." : "Save Public Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
          <div
            className={`rounded-2xl overflow-hidden shadow-2xl p-8 min-h-[400px] flex flex-col items-center justify-center text-center bg-gradient-to-br ${formData.background_gradient}`}
          >
            <img
              src={
                previewUrl ||
                formData.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.display_name || "User")}&size=128`
              }
              alt="Preview"
              className="w-24 h-24 rounded-full border-4 border-white/40 shadow-xl mb-6 object-cover"
            />

            <h2 className="text-3xl font-bold mb-3">
              {formData.display_name || "Your Name"}
            </h2>

            <p className="text-lg opacity-90 max-w-md">
              {formData.bio || "Your bio / tagline will appear here..."}
            </p>

            {formData.instagram && (
              <div className="mt-8 text-5xl">
                <a
                  href={`https://instagram.com/${formData.instagram}`}
                  target="_blank"
                  className="text-white hover:text-pink-300 transition-colors"
                >
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for avatar upload */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-xl font-bold">Upload Profile Picture</h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <XMarkIcon className="w-7 h-7" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  uploadingAvatar
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleAvatarChange({ target: { files: [file] } });
                }}
              >
                <div className="mx-auto w-20 h-20 mb-6 text-purple-500">
                  {uploadingAvatar ? (
                    <svg className="animate-spin" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                    </svg>
                  ) : (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  )}
                </div>

                <p className="text-xl font-medium text-gray-800 mb-2">
                  {uploadingAvatar ? "Uploading..." : "Drag & drop your image here"}
                </p>
                <p className="text-gray-600 mb-1">or</p>
                <p className="text-purple-600 font-medium">click to select file</p>
                <p className="text-sm text-gray-500 mt-4">
                  PNG, JPG, WebP • Max 5MB
                </p>

                {uploadingAvatar && (
                  <div className="mt-8">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">
                      {uploadProgress}% complete
                    </p>
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

            {/* Footer */}
            <div className="flex justify-end gap-4 px-6 py-4 border-t bg-gray-50">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                disabled={uploadingAvatar}
                className={`px-6 py-3 text-white rounded-lg transition ${
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