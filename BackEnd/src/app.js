import express from 'express';
import { rateLimit } from 'express-rate-limit';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';

import { getRfr, getTicker } from './services/DatabaseService.js';
import { loadTickerMap } from './utils/loadTickers.js';
import logger from './services/LoggerService.js';

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
});

const app = express();

app.use(helmet());
app.use(limiter);
app.use(compression());
app.use(
  cors({
    origin: ['https://kevintprivett.github.io', 'http://localhost:5173'],
    methods: ['GET'],
  })
);

const PORT = process.env.PORT || 3000;

let tickerMap;
const updateTickerMap = async () => {
  try {
    tickerMap = await loadTickerMap();
    logger.debug('tickerMap updated successfully');
  } catch (err) {
    logger.error('Error loading ticker map: %s', err);
    process.exit(1);
  }
};

updateTickerMap();
// runs every 4 hours, doesn't run immediately
setInterval(updateTickerMap, 1000 * 60 * 60 * 4);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/rfr', (req, res) => {
  let result;
  try {
    result = getRfr();
  } catch {
    return res.status(500).json({ error: 'Unable to send rfr data' });
  }

  if (result) {
    return res.send(result);
  } else {
    return res.status(500).json({ error: 'Unable to send rfr data' });
  }
});

app.get('/tickers/:ticker', (req, res) => {
  const ticker = req.params.ticker.trim().toLowerCase();

  if (Object.hasOwn(tickerMap, ticker)) {
    let result;
    try {
      result = getTicker(tickerMap[ticker]);
    } catch {
      return res.status(500).json({ error: 'Unable to send ticker data' });
    }

    if (result) {
      return res.json(result);
    }
  }

  // else return failure
  return res.status(404).json({ error: 'Ticker data not found' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, _) => {
  logger.error('Unhandled error: %s', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  logger.debug('SIGTERM signal received: closing server');
  server.close(() => {
    logger.debug('Server closed');
  });
});
