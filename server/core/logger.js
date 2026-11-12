// fs core module: append one line per request to logs/app.log.
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
fs.mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, 'app.log');

// Non-blocking append so a slow disk never holds up the request
function log(message) {
  fs.appendFile(logFile, `${new Date().toISOString()} ${message}\n`, (err) => {
    if (err) console.error('Could not write log:', err.message);
  });
}

// Express middleware
function requestLogger(req, res, next) {
  log(`${req.method} ${req.originalUrl}`);
  next();
}

module.exports = { log, requestLogger };
