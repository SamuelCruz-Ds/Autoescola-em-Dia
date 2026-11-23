import { DateTime } from 'luxon'
import { request } from './ui'

export const systemInfo = () => request<{ zone: string; mode: 'mysql' | 'demo' }>('system:info')
export const dateLabel = (date: string | null) => date ? date.split('-').reverse().join('/') : '—'
export const dateTimeLabel = (value: string, zone: string) => DateTime.fromISO(value, { zone }).toFormat('dd/MM/yyyy HH:mm')
export const dateTimeInput = (value: string, zone: string) => DateTime.fromISO(value, { zone }).toFormat("yyyy-MM-dd'T'HH:mm")
export const today = (zone: string) => DateTime.now().setZone(zone).toISODate()!
