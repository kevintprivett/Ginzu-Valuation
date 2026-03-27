import Database from 'better-sqlite3';
import { NodeCache } from '@cacheable/node-cache';

import logger from './LoggerService.js';

const db = new Database(process.env.SQLITE_DB, { verbose: logger.debug });
db.pragma('journal_mode = WAL');

const cache = new NodeCache({
  stdTTL: 60 * 60 * 1000, // 1 hour
});

// acts as a cache for a given call
const cacheCall = (key, call) => {
  const cached = cache.get(key);

  if (cached) {
    logger.debug('cache hit: ', key);
    return cached;
  }

  logger.debug('cache miss: ', key);

  const val = call();

  cache.set('getRfr', val);

  return val;
};

const getRfrStmt = db.prepare(`
  SELECT *
  FROM risk_free_rates
  ORDER BY created_at DESC
  LIMIT 1;
`);

export const getRfr = () => {
  return cacheCall('getRfr', () => {
    return getRfrStmt.get().rate;
  });
};
