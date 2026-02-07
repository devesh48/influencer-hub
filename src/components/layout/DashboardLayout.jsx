// src/components/layout/DashboardLayout.jsx
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function DashboardLayout() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function checkProfileExists() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile check error:", error);
        return;
      }

      // If no profile exists → send to onboarding
      if (!data) {
        navigate("/dashboard/onboarding", { replace: true });
      }
    }

    checkProfileExists();
  }, [isLoaded, user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <Header
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </div>
  );
}
