// Plain-JS forecasting shared by the Express API and the AWS Lambda handler.
// Both functions return values.length + 1 numbers: a forecast for every past
// day plus one extra entry for the next (unseen) day.

const round = (n) => Math.round(n * 100) / 100;

// Simple Moving Average: forecast for day i = mean of the previous `window` days.
function sma(values, window) {
  const result = [];
  for (let i = 0; i <= values.length; i++) {
    result.push(i < window ? null : round(values.slice(i - window, i).reduce((a, b) => a + b, 0) / window));
  }
  return result;
}

// Single Exponential Smoothing: F(i) = alpha * actual(i-1) + (1 - alpha) * F(i-1)
function ses(values, alpha) {
  if (values.length === 0) return [];
  const result = [values[0]];
  for (let i = 1; i <= values.length; i++) {
    result.push(round(alpha * values[i - 1] + (1 - alpha) * result[i - 1]));
  }
  return result;
}

const forecast = (values, { method, window, alpha }) =>
  method === 'ses' ? ses(values, alpha) : sma(values, window);

module.exports = { forecast };
