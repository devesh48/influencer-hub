// src/App.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useAuth,
} from "@clerk/clerk-react";

// Pages
import Home from "./pages/Home";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import PublicProfilePage from "./features/profile/public/PublicProfilePage";
import DashboardLayout from "./components/layout/DashboardLayout";
import StorePage from "./features/profile/dashboard/StorePage";
import AnalyticsPage from "./features/profile/dashboard/AnalyticsPage";
import NotFound from "./pages/NotFound";
import PublicLayout from "./components/layout/PublicLayout";
import AppearancePage from "./features/profile/dashboard/AppearancePage";
import SettingsPage from "./features/profile/dashboard/SettingsPage";
import OnboardingProfileSetup from "./features/profile/dashboard/OnboardingProfileSetup";
import PublicProfileSettings from "./features/profile/dashboard/PublicProfileSettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home / Landing page */}
        <Route path="/" element={<Home />} />

        {/* Public creator profile */}
        {/* <Route path="/:username" element={<PublicProfilePage />} /> */}
        <Route element={<PublicLayout />}>
          <Route path="/:username" element={<PublicProfilePage />} />
        </Route>

        {/* Clerk auth routes – catch everything under /sign-in/* and /sign-up/* */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* === Protected routes group === */}
        <Route element={<SignedInRedirectCheck />}>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<StorePage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="appearance" element={<AppearancePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="public-profile" element={<PublicProfileSettings />} />

            {/* Onboarding – only shown to new users */}
            <Route path="onboarding" element={<OnboardingProfileSetup />} />
          </Route>
        </Route>

        {/* Catch-all redirect for unauthenticated dashboard attempts */}
        <Route
          path="/dashboard/*"
          element={
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
  /**
   * This component decides what to show when user tries to access /dashboard/... routes
   */
  function SignedInRedirectCheck() {
    const { isLoaded, isSignedIn } = useAuth();

    // Show loading state while Clerk is checking auth status
    if (!isLoaded) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      );
    }

    // If not signed in → redirect to sign-in
    if (!isSignedIn) {
      return <RedirectToSignIn />;
    }

    // If signed in → render children (dashboard layout + pages)
    return <Outlet />;
  }
}

export default App;
