import { test } from 'node:test'
import assert from 'node:assert/strict'
import { commandRouter, DomainError } from '../src/main/commands'

test('IPC executa somente comandos registrados e devolve erros de domínio', async () => {
  const run = commandRouter([{ commands: {
    echo: (input) => input,
    invalid: () => { throw new DomainError('Horário indisponível.') },
  } }])
  assert.deepEqual(await run('echo', 'olá'), { ok: true, data: 'olá' })
  assert.deepEqual(await run('constructor', null), { ok: false, error: 'Operação indisponível.' })
  assert.deepEqual(await run('invalid', null), { ok: false, error: 'Horário indisponível.' })
})
