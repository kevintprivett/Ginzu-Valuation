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
app.use(cors({
  origin: [
    "https://kevintprivett.github.io",
    "http://localhost:3000"
  ],
  methods: ["GET"]
}));


const PORT = process.env.PORT || 3000;

// FIXME: tickermap never refreshes, can make express server force restart every night?
let tickerMap;
try {
  tickerMap = await loadTickerMap();
} catch (err) {
  logger.error("Error loading ticker map: %s", err)
  process.exit(1);
}

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/rfr', (req, res) => {
  let result;
  try {
    result = getRfr();
  } catch {
    return res.status(500).json({error: 'Unable to send rfr data'});
  }

  if (result) {
    return res.send(result);
  } else {
    return res.status(500).json({error: 'Unable to send rfr data'});
  }
});

app.get('/tickers/:ticker', (req, res) => {
  const ticker = req.params.ticker.trim().toLowerCase();

  if (Object.hasOwn(tickerMap, ticker)) {
    let result;
    try {
      result = getTicker(tickerMap[ticker]);
    } catch {
      return res.status(500).json({error: 'Unable to send ticker data'});
    }

    if (result) {
      return res.json(result);
    }
  }

  // else return failure
  return res.status(404).json({error: 'Ticker data not found'});
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error: %s', err);
  res.status(500).json({ error: 'Internal server error' });
});


app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  logger.debug('SIGTERM signal received: closing server')
  app.close(() => {
    logger.debut('Server closed')
  })
})