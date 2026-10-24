import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@kotori-bot/core'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { File } from '../src/service/file'

describe('Loader File Service', () => {
  let tempDir: string
  let fileService: File

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'kotori-file-test-'))
    const ctx = new Context()
    ;(ctx as unknown as { baseDir: { data: string } }).baseDir = { data: tempDir }
    fileService = new File(ctx)
  })

  afterEach(() => rmSync(tempDir, { recursive: true, force: true }))

  test('creates and loads json file correctly', () => {
    fileService.create('config.json', { port: 8080 })
    expect(fileService.load('config.json')).toEqual({ port: 8080 })
  })

  test('saves and updates text file correctly', () => {
    fileService.save('note.txt', 'kotori is awesome', 'text')
    expect(fileService.load('note.txt', 'text')).toBe('kotori is awesome')
  })
})
