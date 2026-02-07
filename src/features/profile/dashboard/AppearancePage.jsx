// src/features/profile/dashboard/AppearancePage.jsx
export default function AppearancePage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Appearance</h1>
      <p className="text-gray-600 mb-10">
        Customize colors, fonts, background and layout of your public profile page
      </p>

      <div className="space-y-12">
        {/* Theme Presets */}
        <section>
          <h2 className="text-xl font-semibold mb-5">Theme Presets</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {['Default', 'Midnight', 'Sunset', 'Ocean', 'Forest'].map((theme) => (
              <button
                key={theme}
                className="aspect-square rounded-xl border-2 border-transparent hover:border-purple-400 overflow-hidden shadow-sm transition"
              >
                <div className={`h-full w-full bg-gradient-to-br ${
                  theme === 'Default' ? 'from-purple-600 to-pink-600' :
                  theme === 'Midnight' ? 'from-gray-900 to-indigo-900' :
                  theme === 'Sunset' ? 'from-orange-500 to-pink-600' :
                  theme === 'Ocean' ? 'from-cyan-500 to-blue-600' :
                  'from-emerald-600 to-teal-600'
                }`} />
                <p className="text-xs mt-2 text-center font-medium">{theme}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Colors */}
        <section>
          <h2 className="text-xl font-semibold mb-5">Custom Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ColorInput label="Primary Color" defaultValue="#7c3aed" />
            <ColorInput label="Accent Color" defaultValue="#ec4899" />
            <ColorInput label="Background" defaultValue="#ffffff" type="gradient" />
          </div>
        </section>

        {/* Font & other toggles */}
        <section className="border-t pt-10">
          <h2 className="text-xl font-semibold mb-6">Typography & Layout</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Heading Font</label>
              <select className="w-full max-w-xs border rounded-lg px-4 py-2.5">
                <option>Inter</option>
                <option>Poppins</option>
                <option>Playfair Display</option>
                <option>DM Sans</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Instagram Follow Button</p>
                <p className="text-sm text-gray-500">Display big follow button at the top</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t flex justify-end gap-4">
        <button className="px-6 py-2.5 border rounded-lg hover:bg-gray-50">Reset</button>
        <button className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function ColorInput({ label, defaultValue, type = 'solid' }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex gap-3">
        <input
          type="color"
          defaultValue={defaultValue}
          className="w-12 h-12 rounded-lg border cursor-pointer"
        />
        <input
          type="text"
          defaultValue={defaultValue}
          className="flex-1 border rounded-lg px-3 py-2 font-mono text-sm"
        />
      </div>
    </div>
  );
}