import type { Tables } from '../../shared/domain'

export type Table = keyof Tables
export type Snapshot = { [K in Table]: Tables[K][] }

export const columns = {
  students: ['id', 'name', 'phone', 'smsConsent', 'theoryGoal', 'practiceGoal'],
  instructors: ['id', 'name', 'phone', 'registration'],
  vehicles: ['id', 'plate', 'model', 'odometerKm', 'reviewKm', 'reviewDate'],
  maintenance: ['id', 'vehicleId', 'serviceDate', 'serviceKm', 'description', 'nextKm', 'nextDate'],
  lessons: ['id', 'studentId', 'instructorId', 'vehicleId', 'kind', 'startsAt', 'endsAt', 'status'],
  exams: ['id', 'studentId', 'kind', 'startsAt', 'result'],
  reminders: ['id', 'lessonId', 'startsAt', 'status', 'updatedAt', 'providerRef'],
} as const satisfies { [K in Table]: readonly (keyof Tables[K])[] }

export interface Reader {
  list<K extends Table>(table: K): Promise<Tables[K][]>
  get<K extends Table>(table: K, id: string): Promise<Tables[K] | undefined>
}
export interface Transaction extends Reader {
  add<K extends Table>(table: K, value: Tables[K]): Promise<void>
  update<K extends Table>(table: K, value: Tables[K]): Promise<void>
}
export interface Store {
  read<T>(run: (db: Reader) => Promise<T>): Promise<T>
  write<T>(run: (db: Transaction) => Promise<T>): Promise<T>
}

export const empty = (): Snapshot => ({
  students: [], instructors: [], vehicles: [], maintenance: [], lessons: [], exams: [], reminders: [],
})
