import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { dirname } from 'node:path'
import type { Tables } from '../../shared/domain'
import { empty, type Reader, type Snapshot, type Store, type Table, type Transaction } from './store'

function memorySession(data: Snapshot): Transaction {
  const rows = <K extends Table>(table: K) => data[table] as Tables[K][]
  return {
    list: async (table) => structuredClone(rows(table)),
    get: async (table, id) => structuredClone(rows(table).find((row) => row.id === id)),
    add: async (table, value) => {
      if (rows(table).some((row) => row.id === value.id)) throw new Error('ID duplicado')
      rows(table).push(structuredClone(value))
    },
    update: async (table, value) => {
      const index = rows(table).findIndex((row) => row.id === value.id)
      if (index < 0) throw new Error('Registro inexistente')
      rows(table)[index] = structuredClone(value)
    },
  }
}

export function demoStore(file?: string): Store {
  let data = empty()
  let loaded = false
  let tail: Promise<unknown> = Promise.resolve()
  async function load() {
    if (loaded) return
    if (file) {
      try {
        data = { ...empty(), ...JSON.parse(await readFile(file, 'utf8')) }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      }
    }
    loaded = true
  }
  function enqueue<T>(run: () => Promise<T>) {
    const next = tail.then(run)
    tail = next.catch(() => undefined)
    return next
  }
  return {
    read: <T>(run: (db: Reader) => Promise<T>) => enqueue(async () => {
      await load()
      return run(memorySession(data))
    }),
    write: <T>(run: (db: Transaction) => Promise<T>) => enqueue(async () => {
      await load()
      const draft = structuredClone(data)
      const result = await run(memorySession(draft))
      if (file) {
        await mkdir(dirname(file), { recursive: true })
        const temp = `${file}.${randomUUID()}.tmp`
        await writeFile(temp, JSON.stringify(draft, null, 2), 'utf8')
        await rename(temp, file)
      }
      data = draft
      return result
    }),
  }
}
