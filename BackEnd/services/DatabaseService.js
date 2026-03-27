import Database from 'better-sqlite3'

const db = new Database(process.env.SQLITE_DB, { verbose: console.log })

db.pragma('journal_mode = WAL')

const getRfrStmt = db.prepare(`
  SELECT *
  FROM risk_free_rates
  ORDER BY created_at DESC
  LIMIT 1;
`)

export const getRfr = () => {
  return getRfrStmt.get().rate
}
