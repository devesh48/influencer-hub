export default function TestimonialBlock({
  text,
  author,
  date,
  avatar,
  rating = 5,
  verified = false,
  className = "",
}) {
  return (
    <div
      className={`
        bg-white/[0.03] backdrop-blur-sm
        border border-white/[0.06]
        rounded-2xl
        p-5
        transition-all duration-300
        hover:bg-white/[0.06]
        hover:border-white/[0.1]
        ${className}
      `}
    >
      {/* Stars */}
      {rating > 0 && (
        <div className="flex items-center gap-0.5 mb-3">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${
                i < rating ? "text-yellow-400" : "text-white/10"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      )}

      {/* Quote */}
      <p className="text-white/70 leading-relaxed text-sm">{text}</p>

      {/* Author */}
      <div className="mt-4 flex items-center gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className="w-9 h-9 rounded-full object-cover border-2 border-white/10"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-white/10 flex items-center justify-center text-white text-sm font-semibold">
            {author?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-white/90 text-sm truncate">{author}</p>
            {verified && (
              <svg className="w-4 h-4 text-purple-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          {date && (
            <p className="text-xs text-white/30">{date}</p>
          )}
        </div>
      </div>
    </div>
  );
}
