import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { demoStore } from '../src/main/data/demo'
import { localToUtc } from '../src/main/validation'

test('armazenamento demo reabre o arquivo e não grava transações incompletas', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'autoescola-'))
  const file = join(dir, 'data.json')
  const db = demoStore(file)
  const student = { id: '1', name: 'Aluno', phone: null, smsConsent: false, theoryGoal: 0, practiceGoal: 1 }
  try {
    await assert.rejects(db.write(async (tx) => { await tx.add('students', student); throw Error('rollback') }))
    assert.deepEqual(await db.read((tx) => tx.list('students')), [])
    await db.write((tx) => tx.add('students', student))
    assert.deepEqual(await demoStore(file).read((tx) => tx.get('students', '1')), student)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('horário da unidade vira UTC sem aceitar horário inválido ou ambíguo', () => {
  assert.equal(localToUtc('2026-08-07T13:00', 'America/Sao_Paulo'), '2026-08-07T16:00:00.000Z')
  assert.throws(() => localToUtc('2026-02-30T10:00', 'America/Sao_Paulo'))
  assert.throws(() => localToUtc('2026-11-01T01:30', 'America/New_York'))
})
