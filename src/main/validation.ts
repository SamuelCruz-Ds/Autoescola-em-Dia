import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import { z } from 'zod'
import { DomainError } from './commands'

export const id = z.uuid()
export const optionalId = z.union([id, z.literal('')]).transform((value) => value || null)
export const rowId = (value?: string) => value || randomUUID()
export const text = (max: number) => z.string().trim().min(1).max(max)
export const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || null)
export const integer = (max: number) => z.union([z.number(), z.string().regex(/^\d+$/)])
  .transform(Number).pipe(z.number().int().min(0).max(max))
export const optionalInteger = (max: number) => z.union([integer(max), z.literal('')])
  .transform((value) => value === '' ? null : value)
export const date = z.iso.date()
export const optionalDate = z.union([date, z.literal('')]).transform((value) => value || null)
export const phone = z.string().trim().transform((value) => value.replace(/[\s()-]/g, ''))
  .pipe(z.union([z.literal(''), z.string().regex(/^\+55[1-9]\d{9,10}$/)]))
  .transform((value) => value || null)

export function required<T>(value: T | undefined, label: string): T {
  if (!value) throw new DomainError(`${label} não encontrado.`)
  return value
}

export function localToUtc(input: string, zone: string) {
  const value = DateTime.fromISO(input, { zone })
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input) || !value.isValid
    || value.toFormat("yyyy-MM-dd'T'HH:mm") !== input || value.getPossibleOffsets().length !== 1) {
    throw new DomainError('Informe uma data e um horário válidos e não ambíguos para o fuso da unidade.')
  }
  return value.toUTC().toISO()!
}
