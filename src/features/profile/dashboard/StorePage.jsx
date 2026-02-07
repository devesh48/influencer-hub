// src/features/profile/dashboard/StorePage.jsx
import ProductCard from '../../../components/store/ProductCard';
import AddProductPlaceholder from '../../../components/store/AddProductPlaceholder';
import { products as mockProducts } from '../../../data/mockData'; // ← you can replace with real data later

export default function StorePage() {
  // In real app → fetch from API / zustand / context
  const products = mockProducts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Store</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create, edit and organize products, services, digital downloads and events
          </p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition">
          + Add Product
        </button>
      </div>

      {/* Stats row – optional quick overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-3xl font-bold mt-1.5">{products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Published</p>
          <p className="text-3xl font-bold mt-1.5 text-green-600">{products.filter(p => p.isActive).length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-3xl font-bold mt-1.5">$1,240</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-3xl font-bold mt-1.5 text-purple-600">+$380</p>
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} {...product} />
        ))}

        <AddProductPlaceholder />
      </div>
    </div>
  );
}