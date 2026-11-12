// AWS Lambda handler reusing the API's forecast function.
// Input (direct invoke or API Gateway JSON body):
//   { "sales": [12, 18, 15, 22], "method": "ses", "window": 3, "alpha": 0.5 }
const { forecast } = require('../server/forecast');

exports.handler = async (event) => {
  const { sales = [], method = 'sma', window = 3, alpha = 0.5 } = event.body ? JSON.parse(event.body) : event;
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, forecast: forecast(sales, { method, window, alpha }) }),
  };
};
