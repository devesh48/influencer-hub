// src/data/mockData.jsx

export const products = [
  {
    id: "prod_001",
    title: "24th Dec Masterclass: Manifest Your SP",
    type: "live-event",
    description: "2-hour live session • Learn advanced reconciliation & attraction techniques",
    price: null, // free
    buttonText: "Get Free Access",
    isActive: true,
    date: "Wed, 24 Dec • 9:00 PM – 11:00 PM",
    imageGradient: "from-purple-600 to-pink-600",
    icon: "✨",
  },
  {
    id: "prod_002",
    title: "30-Day Deep Dive: Attract Committed Love",
    type: "digital-course",
    description: "Daily meditations, workbook, script reprogramming + private community access",
    price: 97,
    originalPrice: 147,
    buttonText: "Enroll Now",
    isActive: true,
    badge: "Best Seller",
    imageGradient: "from-pink-500 to-rose-500",
    icon: "❤️",
  },
  {
    id: "prod_003",
    title: "1:1 Manifestation Coaching (60 min)",
    type: "coaching-call",
    description: "Personal energy audit + custom script + follow-up voice note",
    price: 180,
    buttonText: "Book Session",
    isActive: true,
    availability: "Only 4 spots left this month",
    imageGradient: "from-indigo-500 to-purple-600",
    icon: "🪄",
  },
  {
    id: "prod_004",
    title: "Specific Person Reconciliation Meditation Pack",
    type: "digital-download",
    description: "5 powerful guided audios + PDF journal prompts",
    price: 37,
    buttonText: "Instant Download",
    isActive: true,
    imageGradient: "from-violet-500 to-purple-500",
    icon: "🌙",
  },
  {
    id: "prod_005",
    title: "Tarot + Energy Reading (Voice Message)",
    type: "reading",
    description: "30–40 min detailed voice reading + photo of cards",
    price: 65,
    buttonText: "Order Reading",
    isActive: false,
    imageGradient: "from-amber-500 to-orange-500",
    icon: "🃏",
  },
];

export const testimonials = [
  {
    id: "test_001",
    text: "After your reconciliation meditation on 11th Nov, my SP who blocked me in September called yesterday! Thank you for bringing the charm back in my life ❤️",
    author: "Priya M.",
    date: "2 days ago",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80",
  },
  {
    id: "test_002",
    text: "I was literally feeling very miserable for the last 2 months. Your masterclass changed everything. He proposed last weekend!",
    author: "Aishwarya R.",
    date: "1 week ago",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80",
  },
  {
    id: "test_003",
    text: "The 30-day course is pure magic. I went from anxious attachment to secure — and he started chasing me.",
    author: "Neha K.",
    date: "3 weeks ago",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80",
  },
  {
    id: "test_004",
    text: "Booked a 1:1 session — within 10 days he unblocked me and we had the deepest conversation in 8 months.",
    author: "Riya S.",
    date: "1 month ago",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80",
  },
];

export const analyticsSummary = {
  totalVisits: 3420,
  uniqueVisitors: 1890,
  totalClicks: 870,
  conversionRate: "14.2%",
  monthlyRevenue: 1240,
  thisMonthGrowth: "+38%",
  topLocations: [
    { country: "Canada", percentage: 48, city: "Toronto" },
    { country: "India", percentage: 29, city: "Mumbai" },
    { country: "United States", percentage: 11, city: "New York" },
  ],
  trafficSources: [
    { source: "Instagram", percentage: 62 },
    { source: "TikTok", percentage: 19 },
    { source: "Direct", percentage: 11 },
    { source: "Others", percentage: 8 },
  ],
};

export const engagementChartData = {
  labels: ["Feb 1", "Feb 2", "Feb 3", "Feb 4", "Feb 5", "Feb 6", "Feb 7"],
  visits: [120, 190, 280, 450, 620, 880, 1420],
  clicks: [40, 80, 120, 190, 250, 380, 720],
};

export const currentUser = {
  name: "Devesh Upadhyay",
  username: "mysticshetarot",
  bio: "Helping you manifest love, abundance & soul-aligned relationships • Tarot • Energy Work • Scripting",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120",
  instagram: "mysticshetarot",
};

// Optional — named export of everything in one object (sometimes convenient)
export const mockData = {
  products,
  testimonials,
  analyticsSummary,
  engagementChartData,
  currentUser,
};