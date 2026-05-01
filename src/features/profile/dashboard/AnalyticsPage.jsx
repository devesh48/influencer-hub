import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSupabase } from "../../../contexts/SupabaseContext";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// ── Date helpers ──
function startOfDay(d) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}
function subDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() - n);
  return r;
}
function formatDate(d) {
  return d.toISOString().split("T")[0];
}
function formatShort(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AnalyticsPage() {
  const { user } = useUser();
  const { supabaseAuth } = useSupabase();

  const [bookings, setBookings] = useState([]);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30); // days

  useEffect(() => {
    if (!supabaseAuth || !user?.id) return;

    async function fetchData() {
      setLoading(true);
      try {
        const [bookingsRes, sessionsRes, testimonialsRes] = await Promise.all([
          supabaseAuth
            .from("bookings")
            .select("id, session_type_id, booking_date, start_time, end_time, status, created_at")
            .eq("creator_id", user.id)
            .order("booking_date", { ascending: true }),
          supabaseAuth
            .from("session_types")
            .select("id, title, duration_minutes, price, currency")
            .eq("user_id", user.id),
          supabaseAuth
            .from("testimonials")
            .select("id, author, text, rating, date, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true }),
        ]);

        setBookings(bookingsRes.data || []);
        setSessionTypes(sessionsRes.data || []);
        setTestimonials(testimonialsRes.data || []);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabaseAuth, user?.id]);

  // ── Computed stats ──
  const today = useMemo(() => startOfDay(new Date()), []);
  const rangeStart = useMemo(() => formatDate(subDays(today, range)), [today, range]);

  const filteredBookings = useMemo(
    () => bookings.filter((b) => b.booking_date >= rangeStart),
    [bookings, rangeStart],
  );

  const totalBookings = filteredBookings.length;
  const confirmedBookings = filteredBookings.filter((b) => b.status === "confirmed");
  const pendingBookings = filteredBookings.filter((b) => b.status === "pending");
  const completedBookings = confirmedBookings.filter(
    (b) => b.booking_date < formatDate(today),
  );
  const upcomingBookings = confirmedBookings.filter(
    (b) => b.booking_date >= formatDate(today),
  );

  // Revenue estimate
  const sessionMap = useMemo(() => {
    const m = {};
    sessionTypes.forEach((s) => { m[s.id] = s; });
    return m;
  }, [sessionTypes]);

  const totalRevenue = useMemo(
    () =>
      filteredBookings
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + (sessionMap[b.session_type_id]?.price || 0), 0),
    [filteredBookings, sessionMap],
  );

  // Previous period for comparison
  const prevStart = formatDate(subDays(today, range * 2));
  const prevBookings = useMemo(
    () => bookings.filter((b) => b.booking_date >= prevStart && b.booking_date < rangeStart),
    [bookings, prevStart, rangeStart],
  );
  const prevRevenue = useMemo(
    () =>
      prevBookings
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + (sessionMap[b.session_type_id]?.price || 0), 0),
    [prevBookings, sessionMap],
  );

  function pctChange(curr, prev) {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  }

  const bookingChange = pctChange(totalBookings, prevBookings.length);
  const revenueChange = pctChange(totalRevenue, prevRevenue);
  const completedChange = pctChange(
    completedBookings.length,
    prevBookings.filter((b) => b.status === "confirmed" && b.booking_date < rangeStart).length,
  );

  // ── Booking Trend Chart (line) ──
  const trendData = useMemo(() => {
    const days = [];
    for (let i = range - 1; i >= 0; i--) {
      days.push(formatDate(subDays(today, i)));
    }

    const countMap = {};
    days.forEach((d) => { countMap[d] = 0; });
    filteredBookings.forEach((b) => {
      if (countMap[b.booking_date] !== undefined) countMap[b.booking_date]++;
    });

    // Show fewer labels for readability
    const step = range <= 7 ? 1 : range <= 30 ? 3 : 7;
    const labels = days.map((d, i) => (i % step === 0 || i === days.length - 1 ? formatShort(d) : ""));
    const values = days.map((d) => countMap[d]);

    return {
      labels,
      datasets: [
        {
          label: "Bookings",
          data: values,
          borderColor: "#a855f7",
          backgroundColor: "rgba(168, 85, 247, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: range <= 14 ? 4 : 2,
          pointBackgroundColor: "#a855f7",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [filteredBookings, range, today]);

  // ── Revenue Trend Chart (bar) ──
  const revenueTrendData = useMemo(() => {
    const weeks = [];
    const weekLabels = [];
    const weekRevenue = [];

    const numWeeks = Math.ceil(range / 7);
    for (let w = numWeeks - 1; w >= 0; w--) {
      const wStart = formatDate(subDays(today, (w + 1) * 7 - 1));
      const wEnd = formatDate(subDays(today, w * 7));
      weeks.push({ start: wStart, end: wEnd });
      weekLabels.push(formatShort(wStart));

      const rev = filteredBookings
        .filter((b) => b.status === "confirmed" && b.booking_date >= wStart && b.booking_date <= wEnd)
        .reduce((s, b) => s + (sessionMap[b.session_type_id]?.price || 0), 0);
      weekRevenue.push(rev);
    }

    return {
      labels: weekLabels,
      datasets: [
        {
          label: "Revenue (₹)",
          data: weekRevenue,
          backgroundColor: "rgba(236, 72, 153, 0.6)",
          borderColor: "#ec4899",
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };
  }, [filteredBookings, range, today, sessionMap]);

  // ── Session Type Breakdown (doughnut) ──
  const sessionBreakdownData = useMemo(() => {
    const counts = {};
    filteredBookings.forEach((b) => {
      const name = sessionMap[b.session_type_id]?.title || "Unknown";
      counts[name] = (counts[name] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const values = Object.values(counts);
    const colors = ["#a855f7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };
  }, [filteredBookings, sessionMap]);

  // ── Rating Stats ──
  const ratingStats = useMemo(() => {
    if (testimonials.length === 0) return { avg: 0, total: 0, dist: [0, 0, 0, 0, 0] };
    const dist = [0, 0, 0, 0, 0]; // 1-5 stars
    let sum = 0;
    testimonials.forEach((t) => {
      const r = Math.min(5, Math.max(1, t.rating || 5));
      dist[r - 1]++;
      sum += r;
    });
    return {
      avg: (sum / testimonials.length).toFixed(1),
      total: testimonials.length,
      dist,
    };
  }, [testimonials]);

  const ratingChartData = useMemo(() => ({
    labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
    datasets: [
      {
        label: "Reviews",
        data: ratingStats.dist,
        backgroundColor: [
          "rgba(239,68,68,0.7)",
          "rgba(249,115,22,0.7)",
          "rgba(245,158,11,0.7)",
          "rgba(132,204,22,0.7)",
          "rgba(34,197,94,0.7)",
        ],
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  }), [ratingStats]);

  // ── Status breakdown for stat cards ──
  const statusData = useMemo(() => ({
    labels: ["Completed", "Upcoming", "Pending"],
    datasets: [
      {
        data: [completedBookings.length, upcomingBookings.length, pendingBookings.length],
        backgroundColor: ["#22c55e", "#a855f7", "#f59e0b"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  }), [completedBookings, upcomingBookings, pendingBookings]);

  // ── Chart Options ──
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#f9fafb",
        bodyColor: "#d1d5db",
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#9ca3af", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f3f4f6" },
        ticks: {
          color: "#9ca3af",
          font: { size: 11 },
          stepSize: 1,
          precision: 0,
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1f2937",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `₹${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#9ca3af", font: { size: 11 } } },
      y: {
        beginAtZero: true,
        grid: { color: "#f3f4f6" },
        ticks: {
          color: "#9ca3af",
          font: { size: 11 },
          callback: (v) => `₹${v}`,
        },
      },
    },
  };

  const horizontalBarOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "#f3f4f6" },
        ticks: { color: "#9ca3af", stepSize: 1, precision: 0 },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#6b7280", font: { size: 12 } },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { position: "bottom", labels: { padding: 16, usePointStyle: true, pointStyle: "circle" } },
    },
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time booking, revenue & feedback insights
          </p>
        </div>

        {/* Range selector */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { label: "7D", value: 7 },
            { label: "30D", value: 30 },
            { label: "90D", value: 90 },
            { label: "All", value: 365 },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                range === opt.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Bookings"
          value={totalBookings}
          change={bookingChange}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="purple"
        />
        <StatCard
          label="Completed"
          value={completedBookings.length}
          change={completedChange}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          label="Upcoming"
          value={upcomingBookings.length}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          label="Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          change={revenueChange}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="pink"
        />
      </div>

      {/* ── Booking Trend + Status Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Booking Trend</h2>
          <p className="text-sm text-gray-400 mb-5">Daily bookings over the selected period</p>
          <div className="h-64">
            {totalBookings > 0 ? (
              <Line data={trendData} options={lineOptions} />
            ) : (
              <EmptyState message="No bookings in this period" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Status Breakdown</h2>
          <p className="text-sm text-gray-400 mb-5">Current booking statuses</p>
          <div className="h-52">
            {totalBookings > 0 ? (
              <Doughnut data={statusData} options={doughnutOptions} />
            ) : (
              <EmptyState message="No data yet" />
            )}
          </div>
          {totalBookings > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <MiniStat label="Done" value={completedBookings.length} color="text-green-600" />
              <MiniStat label="Upcoming" value={upcomingBookings.length} color="text-purple-600" />
              <MiniStat label="Pending" value={pendingBookings.length} color="text-yellow-600" />
            </div>
          )}
        </div>
      </div>

      {/* ── Revenue Trend + Session Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Revenue Trend</h2>
          <p className="text-sm text-gray-400 mb-5">Weekly revenue from confirmed bookings</p>
          <div className="h-64">
            {totalRevenue > 0 ? (
              <Bar data={revenueTrendData} options={barOptions} />
            ) : (
              <EmptyState message="No revenue data yet" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Session Types</h2>
          <p className="text-sm text-gray-400 mb-5">Most booked sessions</p>
          <div className="h-52">
            {totalBookings > 0 ? (
              <Doughnut data={sessionBreakdownData} options={doughnutOptions} />
            ) : (
              <EmptyState message="No data yet" />
            )}
          </div>
        </div>
      </div>

      {/* ── Feedback & Rating Analysis ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Rating Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Rating Overview</h2>
          {ratingStats.total > 0 ? (
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900">{ratingStats.avg}</div>
              <div className="flex justify-center gap-0.5 mt-2 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className={`w-5 h-5 ${s <= Math.round(ratingStats.avg) ? "text-yellow-400" : "text-gray-200"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-400">{ratingStats.total} reviews</p>
            </div>
          ) : (
            <EmptyState message="No reviews yet" />
          )}
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Rating Distribution</h2>
          <p className="text-sm text-gray-400 mb-5">Breakdown by star rating</p>
          <div className="h-48">
            {ratingStats.total > 0 ? (
              <Bar data={ratingChartData} options={horizontalBarOptions} />
            ) : (
              <EmptyState message="No reviews yet" />
            )}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Feedback</h2>
          {testimonials.length > 0 ? (
            <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
              {testimonials.slice(-5).reverse().map((t) => (
                <div key={t.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= (t.rating || 5) ? "text-yellow-400" : "text-gray-200"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t.author} {t.date ? `· ${t.date}` : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No feedback yet" />
          )}
        </div>
      </div>

      {/* ── Recent Bookings Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Recent Bookings</h2>
        <p className="text-sm text-gray-400 mb-5">Latest session bookings</p>

        {filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...filteredBookings]
                  .reverse()
                  .slice(0, 10)
                  .map((b) => {
                    const session = sessionMap[b.session_type_id];
                    const isPast = b.booking_date < formatDate(today);
                    const statusLabel =
                      b.status === "confirmed"
                        ? isPast
                          ? "Completed"
                          : "Upcoming"
                        : "Pending";
                    const statusClasses = {
                      Completed: "bg-green-50 text-green-700",
                      Upcoming: "bg-purple-50 text-purple-700",
                      Pending: "bg-yellow-50 text-yellow-700",
                    };

                    return (
                      <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                        <td className="py-3 px-4 text-gray-700">
                          {formatShort(b.booking_date)}
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-medium">
                          {session?.title || "—"}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {session?.price ? `₹${session.price}` : "Free"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusClasses[statusLabel]}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="No bookings in this period" />
        )}
      </div>
    </div>
  );
}

// ── Stat Card ──
function StatCard({ label, value, change, icon, color = "purple" }) {
  const colorMap = {
    purple: { bg: "bg-purple-50", icon: "text-purple-500" },
    green: { bg: "bg-green-50", icon: "text-green-500" },
    blue: { bg: "bg-blue-50", icon: "text-blue-500" },
    pink: { bg: "bg-pink-50", icon: "text-pink-500" },
  };
  const c = colorMap[color] || colorMap.purple;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center ${c.icon}`}>
          {icon}
        </div>
        {change !== undefined && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              change >= 0
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {change >= 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

// ── Mini Stat ──
function MiniStat({ label, value, color }) {
  return (
    <div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

// ── Empty State ──
function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-8">
      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
