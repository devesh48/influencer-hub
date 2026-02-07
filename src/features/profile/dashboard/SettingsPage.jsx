// src/features/profile/dashboard/SettingsPage.jsx
export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-gray-600 mb-10">
        Manage your account, profile information, payments and security
      </p>

      <div className="space-y-12 divide-y">
        {/* Profile */}
        <section className="pb-10">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input
                type="text"
                defaultValue="Tanvi Rateria"
                className="w-full border rounded-lg px-4 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Username / Slug</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-lg text-gray-500">
                  superprofile.bio/
                </span>
                <input
                  type="text"
                  defaultValue="tanvirateria"
                  className="flex-1 border rounded-r-lg px-4 py-2.5"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Bio / Tagline</label>
              <textarea
                rows={3}
                defaultValue="Manifest Love & Commitment with Tanvi! ✨ Helping you call in your soulmate with love, energy & mindset work"
                className="w-full border rounded-lg px-4 py-2.5"
              />
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="py-10">
          <h2 className="text-xl font-semibold mb-6">Account</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                defaultValue="tanvi@example.com"
                className="w-full max-w-md border rounded-lg px-4 py-2.5 bg-gray-50"
                disabled
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add extra security to your account</p>
              </div>
              <button className="px-5 py-2 border rounded-lg hover:bg-gray-50">
                Enable 2FA
              </button>
            </div>
          </div>
        </section>

        {/* Payment & Payouts (placeholder) */}
        <section className="pt-10">
          <h2 className="text-xl font-semibold mb-6">Payments & Payouts</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-sm">
            <p className="font-medium">Stripe not connected yet</p>
            <p className="mt-2 text-gray-700">
              Connect your Stripe account to start receiving payments from digital products, courses and 1:1 sessions.
            </p>
            <button className="mt-4 bg-yellow-600 text-white px-6 py-2.5 rounded-lg hover:bg-yellow-700">
              Connect Stripe →
            </button>
          </div>
        </section>
      </div>

      <div className="mt-12 flex justify-end">
        <button className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
          Save All Changes
        </button>
      </div>
    </div>
  );
}