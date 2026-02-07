// src/components/store/AddProductPlaceholder.jsx
import { PlusIcon } from '@heroicons/react/24/outline';

export default function AddProductPlaceholder() {
  return (
    <div 
      className="
        border-2 border-dashed border-gray-300 
        rounded-xl 
        h-80 sm:h-[420px] 
        flex flex-col 
        items-center justify-center 
        text-center 
        p-8 
        transition-all duration-200 
        hover:border-purple-400 
        hover:bg-purple-50/30 
        hover:shadow-md 
        cursor-pointer 
        group
      "
      role="button"
      tabIndex={0}
      onClick={() => {
        // In real app: open modal / navigate to create page / trigger form
        alert('Add new product modal would open here ✨');
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // same action as click
          alert('Add new product modal would open here ✨');
        }
      }}
    >
      <div className="
        w-16 h-16 
        rounded-full 
        bg-purple-100 
        flex items-center justify-center 
        mb-5 
        group-hover:bg-purple-200 
        transition-colors
      ">
        <PlusIcon className="h-8 w-8 text-purple-600" />
      </div>

      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
        Add New Product
      </h3>

      <p className="mt-3 text-sm text-gray-500 max-w-xs">
        Create a new offer: digital course, 1:1 session, masterclass, e-book, meditation pack, reading, etc.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="text-purple-500">•</span> PDF / Video
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-purple-500">•</span> Live Event
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-purple-500">•</span> Coaching Call
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-purple-500">•</span> Membership
        </div>
      </div>

      <button 
        className="
          mt-8 px-6 py-3 
          bg-purple-600 hover:bg-purple-700 
          text-white text-sm font-medium 
          rounded-lg 
          shadow-sm 
          transition-all 
          active:scale-95
        "
        onClick={(e) => {
          e.stopPropagation(); // prevent parent click if needed
          alert('Opening create product flow...');
        }}
      >
        + Create Product
      </button>
    </div>
  );
}