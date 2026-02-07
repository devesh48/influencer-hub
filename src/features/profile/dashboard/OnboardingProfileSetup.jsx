// src/features/profile/dashboard/OnboardingProfileSetup.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useSupabase } from "../../../contexts/SupabaseContext";

export default function OnboardingProfileSetup() {
  const { user, isLoaded } = useUser();
  const {
    supabaseAuth,
    loading: authLoading,
    error: authError,
  } = useSupabase();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(user?.firstName || "");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  // Auto-fill from Clerk
  useEffect(() => {
    if (user?.firstName) setDisplayName(user.firstName);
  }, [user]);

  // Username availability check
  const checkUsername = async () => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    setFormError("");

    if (!supabaseAuth) {
      setFormError("Authentication not ready yet");
      setCheckingUsername(false);
      return;
    }

    try {
      const { data, error } = await supabaseAuth
        .from("profiles")
        .select("username")
        .eq("username", username.toLowerCase())
        .maybeSingle();

      if (error) throw error;
      setUsernameAvailable(!data); // true = available
    } catch (err) {
      console.error("Username check failed:", err);
      setFormError("Could not check username availability");
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!username || !displayName) {
      setFormError("Username and display name are required");
      return;
    }

    if (usernameAvailable !== true) {
      setFormError(
        usernameAvailable === false
          ? "Username is already taken"
          : "Please check username availability",
      );
      return;
    }
    setFormLoading(true);
    try {
      // 1. Upsert profile
      const { error: upsertError } = await supabaseAuth.from("profiles").upsert(
        {
          id: user.id,
          username: username.toLowerCase().trim(),
          display_name: displayName.trim(),
          bio: bio.trim(),
          instagram: instagram.trim() || null,
          avatar_url: user?.imageUrl || null,
          // Do NOT send created_at — let Supabase handle it
        },
        { onConflict: "id" },
      );

      if (upsertError) throw upsertError;
      console.log("Profile saved successfully!");
      // Optional: sync username to Clerk metadata
      // await user.update({
      //   publicMetadata: {
      //     ...user.publicMetadata, // preserve existing metadata if any
      //     username: username.toLowerCase().trim(),
      //   },
      // });

      // Success → go to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Profile setup failed:", err);
      setFormError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  if (!isLoaded || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600"></div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center px-4">
        <div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Authentication Error
          </h2>
          <p className="text-gray-700 mb-6">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-center mb-2">
          Welcome! Let's set up your profile
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Choose a unique username and tell the world a bit about yourself
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Public URL <span className="text-red-500">*</span><span className="flex items-center text-gray-500"> @creatorhub</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                /
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.replace(/\s+/g, ""));
                  setUsernameAvailable(null);
                }}
                onBlur={checkUsername}
                placeholder="youruniquehandle"
                className={`block w-full pl-8 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  usernameAvailable === true
                    ? "border-green-500"
                    : usernameAvailable === false
                      ? "border-red-500"
                      : "border-gray-300"
                }`}
                required
                minLength={3}
                pattern="[a-zA-Z0-9_]+"
                title="Only letters, numbers, and underscores"
              />
            </div>

            {checkingUsername && (
              <p className="mt-1 text-sm text-gray-500">Checking...</p>
            )}
            {usernameAvailable === true && username.length >= 3 && (
              <p className="mt-1 text-sm text-green-600">✓ Available!</p>
            )}
            {usernameAvailable === false && (
              <p className="mt-1 text-sm text-red-600">
                Sorry, this username is taken.
              </p>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio / Tagline
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Helping you manifest love, abundance & soul-aligned relationships ✨"
              rows={3}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instagram Handle
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                @
              </span>
              <input
                type="text"
                value={instagram}
                onChange={(e) =>
                  setInstagram(e.target.value.replace(/\s+/g, ""))
                }
                placeholder="yourhandle"
                className="block w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={
              formLoading || checkingUsername || usernameAvailable !== true
            }
            className={`w-full py-4 px-6 text-white font-medium rounded-xl transition-all ${
              formLoading || checkingUsername || usernameAvailable !== true
                ? "bg-purple-300 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg active:scale-95"
            }`}
          >
            {formLoading ? "Saving..." : "Complete Setup & Go to Dashboard"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          You can edit these later in Settings
        </p>
      </div>
    </div>
  );
}
