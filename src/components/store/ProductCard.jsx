export default function ProductCard({ title, description, price, buttonText = "Get it", isPublic = false }) {
  return (
    <div className={`rounded-2xl overflow-hidden shadow-2xl ${isPublic ? 'bg-white text-gray-900' : 'bg-gray-800 text-white'}`}>
      <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-6xl text-white">
        <i className="fas fa-heart"></i> {/* font-awesome or heroicon */}
      </div>
      <div className="p-6">
        <h3 className="font-bold text-xl">{title}</h3>
        <p className="mt-1 text-sm opacity-80">{description}</p>
        {price && <p className="mt-4 text-2xl font-bold">${price}</p>}
        <button className="mt-5 w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-4 rounded-xl transition">
          {buttonText} →
        </button>
      </div>
    </div>
  );
}