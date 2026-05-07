import Database from 'better-sqlite3';
import { NodeCache } from '@cacheable/node-cache';

import logger from './LoggerService.js';

// { verbose: logger.debug }
const db = new Database(process.env.SQLITE_DB);
db.pragma('journal_mode = WAL');

const cache = new NodeCache({
  stdTTL: 60 * 60 * 1000, // 1 hour
});

// acts as a cache for a given call
const cacheCall = (key, call) => {
  const cached = cache.get(key);

  if (cached) {
    logger.debug('cache hit: %s', key);
    return cached !== -1 ? cached : null;
  }

  logger.debug('cache miss: %s', key);

  let val = call();

  if (!val) {
    val = -1;
  }

  cache.set(key, val);

  return val !== -1 ? val : null;
};

const getRfrStmt = db.prepare(`
  SELECT *
  FROM risk_free_rates
  ORDER BY created_at DESC
  LIMIT 1;
`);

/**
 * Gets most recent RFR
 * @returns {string} most recent rfr as xx.xx (percent implied)
 * @throws error for db
 */
export const getRfr = () => {
  return cacheCall('getRfr', () => {
    let result;

    try {
      result = getRfrStmt.get()?.rate;
    } catch (err) {
      logger.error('Error getting rfr data: %s', err);
      throw err;
    }

    return result ? result : null;
  });
};

const getTickerStmt = db.prepare(`
  SELECT data_jsonb
  FROM tickers
  WHERE cik=CAST (? AS INTEGER);
`);

/**
 * Gets the parsed json of the requested ticker
 * @param {int} cik id
 * @returns {object|undefined} parsed json or undefined
 * @throws error for db and json parsing
 */
export const getTicker = (cik) => {
  return cacheCall(`getTicker_${cik}`, () => {
    let resultRaw;
    try {
      resultRaw = getTickerStmt.get(cik)?.data_jsonb;
    } catch (err) {
      logger.error('Error getting ticker data: %s', err);
      throw err;
    }

    if (resultRaw) {
      try {
        return JSON.parse(resultRaw);
      } catch (err) {
        logger.error('Error parsing ticker data: %s', err);
        throw err;
      }
    }
  });
};

process.on('SIGINT', () => db.close());
