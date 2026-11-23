import { app } from 'electron'
import { join } from 'node:path'
import { demoStore } from './data/demo'
import { mysqlStore } from './data/mysql'
import type { Store } from './data/store'
import { settings } from './settings'

let store: Store | undefined
export function database(): Store {
  if (store) return store
  const cfg = settings()
  if (cfg.DB_MODE === 'mysql') {
    store = mysqlStore({
      host: cfg.DB_HOST, port: cfg.DB_PORT, user: cfg.DB_USER,
      password: cfg.DB_PASSWORD, database: cfg.DB_NAME,
    })
  } else {
    store = demoStore(join(process.env.AUTOESCOLA_DATA_DIR ?? app.getPath('userData'), 'dados-demo.json'))
  }
  return store
}
