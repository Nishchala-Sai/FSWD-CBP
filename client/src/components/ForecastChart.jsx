import { Line } from 'react-chartjs-2';
import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const axis = { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } };
const options = {
  responsive: true,
  plugins: { legend: { labels: { color: '#d1d5db' } } },
  scales: { x: axis, y: axis },
};

const line = (label, data, color) => ({ label, data, borderColor: color, backgroundColor: color });

export default function ForecastChart({ history, sma, ses, smaWindow, alpha }) {
  const data = {
    labels: [...history.map((h) => h.date), 'Next day'],
    datasets: [
      line('Actual sales', history.map((h) => h.quantity), '#3b82f6'),
      { ...line(`SMA (k=${smaWindow})`, sma, '#f59e0b'), borderDash: [5, 5] },
      line(`SES (α=${alpha})`, ses, '#10b981'),
    ],
  };
  return <Line data={data} options={options} />;
}
