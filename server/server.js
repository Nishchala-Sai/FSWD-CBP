const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { requestLogger } = require('./core/logger');
const auth = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', auth, require('./routes/products'));
app.use('/api/sales', auth, require('./routes/sales'));

// Express 5 forwards errors thrown in async routes here
const statusByError = { ValidationError: 400, CastError: 400, DocumentNotFoundError: 404 };
app.use((err, req, res, next) => {
  if (err.code === 11000) return res.status(409).json({ error: `${Object.keys(err.keyValue)} already exists` });
  const status = statusByError[err.name] ?? 500;
  res.status(status).json({ error: status === 404 ? 'Not found' : err.message });
});

const PORT = process.env.PORT ?? 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(PORT, (err) => {
      if (err) throw err; // e.g. port already in use
      console.log(`API running on http://localhost:${PORT}`);
    }),
  )
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
