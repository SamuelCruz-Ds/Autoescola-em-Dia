export const CHANNEL = 'autoescola:request'

export type Reply<T> = { ok: true; data: T } | { ok: false; error: string }
export interface Bridge {
  request(command: string, input?: unknown): Promise<Reply<unknown>>
}
