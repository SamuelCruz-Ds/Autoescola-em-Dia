import { ZodError } from 'zod'
import type { Reply } from '../shared/bridge'

export class DomainError extends Error {}
export type Handler = (input: unknown) => unknown | Promise<unknown>
export interface Feature {
  commands?: Record<string, Handler>
  start?: () => () => void
}

export function commandRouter(features: Feature[]) {
  const handlers = new Map<string, Handler>()
  for (const feature of features) {
    for (const [name, handler] of Object.entries(feature.commands ?? {})) {
      if (handlers.has(name)) throw new Error(`Comando duplicado: ${name}`)
      handlers.set(name, handler)
    }
  }
  return async (name: unknown, input: unknown): Promise<Reply<unknown>> => {
    const handler = typeof name === 'string' ? handlers.get(name) : undefined
    if (!handler) return { ok: false, error: 'Operação indisponível.' }
    try {
      return { ok: true, data: await handler(input) }
    } catch (error) {
      if (error instanceof DomainError) return { ok: false, error: error.message }
      if (error instanceof ZodError) {
        return { ok: false, error: 'Confira os campos obrigatórios e os valores informados.' }
      }
      // Apenas o tipo/código é registrado: erros de provedores podem conter dados pessoais.
      const code = (error as { code?: unknown } | null)?.code
      console.error('Operação não concluída:', typeof code === 'string' ? code : 'erro interno')
      return { ok: false, error: 'Não foi possível concluir. Confira a configuração e tente novamente.' }
    }
  }
}
