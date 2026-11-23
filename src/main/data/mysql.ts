import mysql, { type PoolConnection, type PoolOptions, type RowDataPacket } from 'mysql2/promise'
import type { Tables } from '../../shared/domain'
import { columns, type Store, type Table, type Transaction } from './store'

function sqlValue(value: unknown) {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  throw new Error('Campo não persistível')
}

function mysqlSession(connection: PoolConnection): Transaction {
  const quote = (field: string) => `\`${field}\``
  const select = (table: Table) => `SELECT ${columns[table].map(quote).join(', ')} FROM ${quote(table)}`
  function decode<K extends Table>(table: K, row: RowDataPacket) {
    if (table === 'students') row.smsConsent = Boolean(row.smsConsent)
    return { ...row } as Tables[K]
  }
  return {
    list: async (table) => {
      const [rows] = await connection.query<RowDataPacket[]>(select(table))
      return rows.map((row) => decode(table, row))
    },
    get: async (table, id) => {
      const [rows] = await connection.execute<RowDataPacket[]>(`${select(table)} WHERE id = ?`, [id])
      return rows[0] ? decode(table, rows[0]) : undefined
    },
    add: async (table, row) => {
      const keys = columns[table] as readonly (keyof typeof row & string)[]
      await connection.execute(
        `INSERT INTO ${quote(table)} (${keys.map(quote).join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
        keys.map((key) => sqlValue(row[key])),
      )
    },
    update: async (table, row) => {
      const keys = (columns[table] as readonly (keyof typeof row & string)[]).filter((key) => key !== 'id')
      await connection.execute(
        `UPDATE ${quote(table)} SET ${keys.map((key) => `${quote(key)} = ?`).join(', ')} WHERE id = ?`,
        [...keys.map((key) => sqlValue(row[key])), row.id],
      )
    },
  }
}

export function mysqlStore(options: PoolOptions): Store & { close: () => Promise<void> } {
  const pool = mysql.createPool({
    ...options,
    charset: 'utf8mb4',
    dateStrings: true,
    connectionLimit: 5,
    connectTimeout: 5_000,
  })
  async function run<T>(write: boolean, work: (db: Transaction) => Promise<T>): Promise<T> {
    const connection = await pool.getConnection()
    try {
      await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ')
      if (write) {
        await connection.beginTransaction()
        // Um único bloqueio ordena as escritas de agenda e odômetro entre estações.
        const [lock] = await connection.query<RowDataPacket[]>('SELECT id FROM app_lock WHERE id = 1 FOR UPDATE')
        if (lock.length !== 1) throw new Error('Schema não inicializado')
      } else {
        await connection.query('START TRANSACTION READ ONLY')
      }
      const value = await work(mysqlSession(connection))
      await connection.commit()
      return value
    } catch (error) {
      await connection.rollback().catch(() => undefined)
      throw error
    } finally {
      connection.release()
    }
  }
  return { read: (work) => run(false, work), write: (work) => run(true, work), close: () => pool.end() }
}
