import { config } from 'dotenv'
import { IANAZone } from 'luxon'
import { resolve } from 'node:path'
import { z } from 'zod'

const decimal = (min: number, max: number) =>
  z.preprocess((value) => value === undefined || value === '' ? undefined : Number(value),
    z.number().min(min).max(max).optional())

const schema = z.object({
  DB_MODE: z.enum(['demo', 'mysql']).default('demo'),
  DB_HOST: z.string().min(1).default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_USER: z.string().min(1).default('autoescola'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().min(1).default('autoescola'),
  SCHOOL_TIMEZONE: z.string().refine((value) => IANAZone.isValidZone(value)).default('America/Sao_Paulo'),
  WEATHER_LATITUDE: decimal(-90, 90),
  WEATHER_LONGITUDE: decimal(-180, 180),
  WEATHER_HEAVY_MM: decimal(0.1, 250),
  WEATHER_API_KEY: z.string().trim().default(''),
  SMS_ENABLED: z.enum(['0', '1']).default('0'),
  TWILIO_ACCOUNT_SID: z.string().default(''),
  TWILIO_AUTH_TOKEN: z.string().default(''),
  TWILIO_FROM: z.string().default(''),
})

export function parseSettings(env: NodeJS.ProcessEnv) {
  return schema.parse(env)
}

export type Settings = ReturnType<typeof parseSettings>
let cached: Settings | undefined
export function settings(): Settings {
  if (cached) return cached
  config({ path: process.env.AUTOESCOLA_ENV_FILE ?? resolve('.env'), quiet: true })
  cached = parseSettings(process.env)
  return cached
}
