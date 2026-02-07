// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

// Pages
import Home from "./pages/Home";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import PublicProfilePage from "./features/profile/public/PublicProfilePage";
import DashboardLayout from "./components/layout/DashboardLayout";
import StorePage from "./features/profile/dashboard/StorePage";
import AnalyticsPage from "./features/profile/dashboard/AnalyticsPage";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home / Landing page */}
        <Route path="/" element={<Home />} />

        {/* Public creator profile */}
        <Route path="/:username" element={<PublicProfilePage />} />

        {/* Clerk auth routes – catch everything under /sign-in/* and /sign-up/* */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <SignedIn>
              <DashboardLayout />
            </SignedIn>
          }
        >
          <Route index element={<StorePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          {/* ... other dashboard sub-routes */}
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
}

export default App;
