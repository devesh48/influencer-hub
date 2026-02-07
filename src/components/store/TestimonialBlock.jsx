// src/components/store/TestimonialBlock.jsx

export default function TestimonialBlock({
  text,
  author,
  date,
  avatar,
  rating = 5,
  verified = false,
  className = '',
}) {
  return (
    <div
      className={`
        bg-white/10 backdrop-blur-md 
        border border-white/20 
        rounded-2xl 
        p-6 
        shadow-xl 
        transition-all duration-300 
        hover:shadow-2xl hover:scale-[1.02]
        ${className}
      `}
    >
      <div className="relative">
        <span className="absolute -left-2 -top-4 text-6xl text-white/20 leading-none">“</span>
        <p className="text-white text-opacity-95 leading-relaxed">{text}</p>
      </div>

      <div className="mt-5 flex items-center gap-4">
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className="w-12 h-12 rounded-full object-cover border-2 border-white/30 shadow-md"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
            {author?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-white">{author}</p>
            {verified && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                ✓ Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-white text-opacity-70">{date}</span>

            {rating > 0 && (
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-white/30'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}