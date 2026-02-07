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

const options = { responsive: true, maintainAspectRatio: false };

const data = {
  labels: ['Feb 1', 'Feb 2', 'Feb 3', 'Feb 4', 'Feb 5', 'Feb 6', 'Feb 7'],
  datasets: [
    { label: 'Visits', data: [120, 190, 280, 450, 620, 880, 1420], backgroundColor: '#a855f7' },
    { label: 'Clicks', data: [40, 80, 120, 190, 250, 380, 720], backgroundColor: '#ec4899' },
  ],
};

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Analytics Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Visits" value="3,420" />
        <StatCard label="Unique Visitors" value="1,890" />
        <StatCard label="Link Clicks" value="870" />
        <StatCard label="Conversion" value="14%" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Last 7 Days Activity</h3>
        <div className="h-80">
          <Bar options={options} data={data} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow text-center">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}