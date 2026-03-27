import Database from 'better-sqlite3'
import { NodeCache } from '@cacheable/node-cache'

const db = new Database(process.env.SQLITE_DB, { verbose: console.log })
db.pragma('journal_mode = WAL')

const cache = new NodeCache({
  stdTTL: 60*60*1000, // 1 hour
});

// TODO: move to a util class?
const cacheCall = (key, call) => {
  const cached = cache.get(key)

  if (cached) {
    console.log(`cache hit: ${key}`)
    return cached
  }

  console.log(`cache miss: ${key}`)

  const val = call()

  cache.set('getRfr', val)

  return val
}

const getRfrStmt = db.prepare(`
  SELECT *
  FROM risk_free_rates
  ORDER BY created_at DESC
  LIMIT 1;
`)

export const getRfr = () => {
  return cacheCall('getRfr', () => {
    return getRfrStmt.get().rate
  })
}