export const lessonKinds = ['teorica', 'pratica'] as const
export const lessonStates = ['marcada', 'realizada', 'falta', 'cancelada'] as const
export const examResults = ['pendente', 'aprovado', 'reprovado', 'ausente'] as const
export type LessonKind = typeof lessonKinds[number]
export type LessonState = typeof lessonStates[number]
export type ExamResult = typeof examResults[number]

export const kindLabel: Record<LessonKind, string> = { teorica: 'Teórica', pratica: 'Prática' }
export const lessonLabel: Record<LessonState, string> = {
  marcada: 'Marcada', realizada: 'Realizada', falta: 'Falta', cancelada: 'Cancelada',
}
export const examLabel: Record<ExamResult, string> = {
  pendente: 'Pendente', aprovado: 'Aprovado', reprovado: 'Reprovado', ausente: 'Ausente',
}

export interface Student {
  id: string
  name: string
  phone: string | null
  smsConsent: boolean
  theoryGoal: number
  practiceGoal: number
}
export interface Instructor { id: string; name: string; phone: string | null; registration: string | null }
export interface Vehicle {
  id: string
  plate: string
  model: string
  odometerKm: number
  reviewKm: number | null
  reviewDate: string | null
}
export interface Maintenance {
  id: string
  vehicleId: string
  serviceDate: string
  serviceKm: number
  description: string
  nextKm: number | null
  nextDate: string | null
}
export interface Lesson {
  id: string
  studentId: string
  instructorId: string
  vehicleId: string | null
  kind: LessonKind
  startsAt: string
  endsAt: string
  status: LessonState
}
export interface Exam {
  id: string
  studentId: string
  kind: LessonKind
  startsAt: string
  result: ExamResult
}
export type ReminderStatus = 'enviando' | 'enviado' | 'falhou'
export interface Reminder {
  id: string
  lessonId: string
  startsAt: string
  status: ReminderStatus
  updatedAt: string
  providerRef: string | null
}
export interface Tables {
  students: Student
  instructors: Instructor
  vehicles: Vehicle
  maintenance: Maintenance
  lessons: Lesson
  exams: Exam
  reminders: Reminder
}
