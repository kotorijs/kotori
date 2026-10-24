import { describe, expect, test } from 'vitest'
import { Command } from '../src/components/command'

describe('Core Command', () => {
  test('creates command and formats definition correctly', () => {
    const cmd = new Command('test <name:string> [age:number=18] - test command')
    expect(cmd.meta.root).toBe('test')
    expect(cmd.meta.description).toBe('test command')
    expect(cmd.meta.args).toHaveLength(2)
    expect(cmd.meta.args[0]).toMatchObject({ name: 'name', type: 'string', optional: false })
    expect(cmd.meta.args[1]).toMatchObject({ name: 'age', type: 'number', optional: true, default: 18 })
  })

  test('parses options correctly', () => {
    const cmd = new Command('serve').option('P', 'port:number server')
    expect(cmd.meta.options).toHaveLength(1)
    expect(cmd.meta.options[0]).toMatchObject({ name: 'P', realname: 'port', type: 'number', description: 'server' })
  })
})
