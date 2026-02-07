// src/features/profile/dashboard/AnalyticsPage.jsx
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' } },
};

const mockChartData = {
  labels: ['Feb 1', 'Feb 2', 'Feb 3', 'Feb 4', 'Feb 5', 'Feb 6', 'Feb 7'],
  datasets: [
    {
      label: 'Page Visits',
      data: [120, 190, 280, 450, 620, 880, 1420],
      backgroundColor: 'rgba(168, 85, 247, 0.6)',
      borderColor: '#a855f7',
      borderWidth: 1,
    },
    {
      label: 'Link Clicks',
      data: [40, 80, 120, 190, 250, 380, 720],
      backgroundColor: 'rgba(236, 72, 153, 0.6)',
      borderColor: '#ec4899',
      borderWidth: 1,
    },
  ],
};

export default function AnalyticsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-gray-600">
          Track visits, clicks, conversions and audience insights
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard label="Total Visits" value="3,420" change="+18%" />
        <StatCard label="Unique Visitors" value="1,890" change="+12%" />
        <StatCard label="Total Clicks" value="870" change="+31%" />
        <StatCard label="Conversion Rate" value="14.2%" change="+4.1%" isPositive />
      </div>

      {/* Main chart */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-10">
        <h2 className="text-lg font-semibold mb-5">Engagement Over Time</h2>
        <div className="h-80">
          <Bar options={chartOptions} data={mockChartData} />
        </div>
      </div>

      {/* Top locations / sources placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Top Locations</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between"><span>Canada</span><span>48%</span></li>
            <li className="flex justify-between"><span>India</span><span>29%</span></li>
            <li className="flex justify-between"><span>United States</span><span>11%</span></li>
            <li className="flex justify-between"><span>United Kingdom</span><span>6%</span></li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between"><span>Instagram</span><span>62%</span></li>
            <li className="flex justify-between"><span>TikTok</span><span>19%</span></li>
            <li className="flex justify-between"><span>Direct</span><span>11%</span></li>
            <li className="flex justify-between"><span>Other</span><span>8%</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, isPositive = true }) {
  const color = isPositive ? 'text-green-600' : 'text-red-600';
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className={`mt-1 text-sm ${color}`}>
        {change} {isPositive ? '↑' : '↓'} vs last period
      </p>
    </div>
  );
}