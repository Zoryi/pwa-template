import { Capacitor } from '@capacitor/core'
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'

const sqlite = new SQLiteConnection(CapacitorSQLite)
const DB_NAME = 'pwa_starter_db'
const STORE_TABLE = 'storage'

let db = null
let initPromise = null

async function initDB() {
  if (db) return db
  if (initPromise) return initPromise
  initPromise = (async () => {
    try {
      let conn
      try {
        conn = await sqlite.retrieveConnection(DB_NAME)
      } catch {
        await CapacitorSQLite.closeConnection({ database: DB_NAME }).catch(() => {})
        conn = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false)
      }
      await conn.open()
      await conn.execute(`CREATE TABLE IF NOT EXISTS ${STORE_TABLE} (key TEXT PRIMARY KEY, value TEXT)`)
      db = conn
      return db
    } catch (e) {
      initPromise = null
      throw e
    }
  })()
  return initPromise
}

export const storage = {
  async get(key, defaultValue = undefined) {
    await initDB()
    const res = await db.query(`SELECT value FROM ${STORE_TABLE} WHERE key = ?`, [key])
    if (res.values && res.values.length > 0) {
      return JSON.parse(res.values[0].value)
    }
    return defaultValue
  },

  async set(key, value) {
    await initDB()
    const serialized = JSON.stringify(value)
    await db.run(`INSERT OR REPLACE INTO ${STORE_TABLE} (key, value) VALUES (?, ?)`, [key, serialized])
  },

  async delete(key) {
    await initDB()
    await db.run(`DELETE FROM ${STORE_TABLE} WHERE key = ?`, [key])
  },

  async clear() {
    await initDB()
    await db.run(`DELETE FROM ${STORE_TABLE}`)
  },

  async keys() {
    await initDB()
    const res = await db.query(`SELECT key FROM ${STORE_TABLE}`)
    return (res.values || []).map(row => row.key)
  },

  async entries() {
    await initDB()
    const res = await db.query(`SELECT key, value FROM ${STORE_TABLE}`)
    return (res.values || []).map(row => [row.key, JSON.parse(row.value)])
  },
}
