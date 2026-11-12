import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { api } from '../api';
import ForecastChart from '../components/ForecastChart';

const SMA_WINDOW = 3;

// Inline style objects (the rest of the app uses index.css)
const styles = {
  summary: { display: 'flex', gap: '2rem', margin: '1rem 0' },
  value: { fontSize: '1.75rem', fontWeight: 700, color: '#10b981' },
};

export default function Forecast() {
  const { id } = useParams();
  const [alpha, setAlpha] = useState(0.5);
  const [sma, setSma] = useState(null);
  const [ses, setSes] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/products/${id}/forecast?method=sma&window=${SMA_WINDOW}`)
      .then(setSma)
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    let ignore = false; // drop a slow response if the slider has already moved on
    api(`/products/${id}/forecast?method=ses&alpha=${alpha}`)
      .then((data) => !ignore && setSes(data))
      .catch((err) => setError(err.message));
    return () => {
      ignore = true;
    };
  }, [id, alpha]);

  if (error) return <p className="error">{error}</p>;
  if (!sma || !ses) return <p>Loading forecast...</p>;

  return (
    <div className="card">
      <h2>{sma.product.name} ({sma.product.sku})</h2>
      <div style={styles.summary}>
        <div>
          Next-day SMA
          <div style={styles.value}>{sma.forecast.at(-1)}</div>
        </div>
        <div>
          Next-day SES
          <div style={styles.value}>{ses.forecast.at(-1)}</div>
        </div>
      </div>
      <label className="slider-label">
        Smoothing factor α = {alpha}
        <input
          className="slider"
          type="range"
          min="0.1"
          max="0.9"
          step="0.1"
          value={alpha}
          onChange={(e) => setAlpha(Number(e.target.value))}
        />
      </label>
      <ForecastChart history={sma.history} sma={sma.forecast} ses={ses.forecast} smaWindow={SMA_WINDOW} alpha={alpha} />
    </div>
  );
}
