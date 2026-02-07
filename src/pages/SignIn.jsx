import { SignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function SignInPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to your dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage your products, analytics & profile
          </p>
        </div>

        <SignIn
        routing="hash"          // ← this is the key change
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-md",
            card: "shadow-xl border border-gray-200 rounded-xl",
          },
        }}
      />
      </div>
    </div>
  );
}