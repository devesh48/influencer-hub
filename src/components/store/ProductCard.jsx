export default function ProductCard({
  title,
  description,
  price,
  original_price,
  type,
  currency,
  button_text,
  buttonText,
  isPublic = false,
  onOrder,
}) {
  const typeLabels = {
    course: "Course",
    masterclass: "Masterclass",
    download: "Download",
    coaching: "Coaching",
    service: "Service",
    reading: "Reading",
    membership: "Membership",
  };

  const typeIcons = {
    course: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    masterclass: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    download: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    reading: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    default: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  };

  const btnText = button_text || buttonText || "Get it";
  const currSymbol = currency === "USD" ? "$" : "₹";
  const hasDiscount = original_price && price && original_price > price;
  const discountPct = hasDiscount
    ? Math.round(((original_price - price) / original_price) * 100)
    : 0;

  if (isPublic) {
    return (
      <div className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 transition-all duration-300 hover:bg-white/[0.07] hover:border-white/[0.1] hover:-translate-y-0.5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/[0.08] flex items-center justify-center text-purple-400">
            {typeIcons[type] || typeIcons.default}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  {type && (
                    <span className="text-xs font-medium text-white/30 uppercase tracking-wide">
                      {typeLabels[type] || type}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                      {discountPct}% OFF
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-white text-lg leading-snug mt-0.5">
                  {title}
                </h3>
              </div>
              <div className="text-right shrink-0">
                {original_price && (
                  <span className="text-sm text-white/30 line-through block">
                    {currSymbol}{original_price}
                  </span>
                )}
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {price ? `${currSymbol}${price}` : "Free"}
                </span>
              </div>
            </div>
            {description && (
              <p className="mt-1.5 text-sm text-white/40 leading-relaxed line-clamp-2">
                {description}
              </p>
            )}
            <button
              onClick={onOrder}
              className="mt-4 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {btnText} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard variant — should not be used anymore (StorePage has inline cards)
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100">
      <div className="h-36 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white/80">
        {typeIcons[type] || typeIcons.default}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
        )}
        {price && <p className="mt-3 text-2xl font-bold text-gray-900">{currSymbol}{price}</p>}
        <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition">
          {btnText} →
        </button>
      </div>
    </div>
  );
}
