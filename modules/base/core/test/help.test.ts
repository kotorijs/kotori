import { Context, Symbols } from 'kotori-bot'
import { describe, expect, test } from 'vitest'
import { config, main } from '../src'

describe('Core Plugin /help', () => {
  test('registers help command and returns all commands when no args provided', async () => {
    const ctx = new Context()
    main(ctx, config.parse({}))

    const helpCmd = Array.from(ctx[Symbols.command]).find((cmd) => cmd.meta.root === 'help')
    expect(helpCmd).toBeDefined()

    const mockSession = {
      api: {
        adapter: {
          config: { commandPrefix: '/' }
        }
      },
      format: (key: string, data: Record<string, string>) => {
        if (key === 'core.msg.help') return `查询到以下相关指令：${data.content}`
        if (key === 'core.msg.descr.command') return `\n${data.root}${data.args} ${data.description}`
        if (key === 'core.msg.descr.command2') return `${data.root}${data.args} ${data.description}`
        return data.content ?? ''
      },
      i18n: {
        locale: (k: string) => k
      }
    }

    // 1. Direct /help with empty args -> should return list of all commands
    const action = helpCmd!.meta.action!
    // biome-ignore lint/suspicious/noExplicitAny: mock action call
    const resultAll = await action({ args: [], options: {} } as any, mockSession as any)
    expect(resultAll).toContain('查询到以下相关指令：')
    expect(resultAll).toContain('/core')
    expect(resultAll).toContain('/bot')
    expect(resultAll).toContain('/help')

    // 2. /help bot -> should return single command details
    // biome-ignore lint/suspicious/noExplicitAny: mock action call
    const resultBot = await action({ args: ['bot'], options: {} } as any, mockSession as any)
    expect(resultBot).toContain('/bot')

    // 3. /help non_existent -> should return fail message
    // biome-ignore lint/suspicious/noExplicitAny: mock action call
    const resultFail = await action({ args: ['non_existent'], options: {} } as any, mockSession as any)
    expect(resultFail).toBe('core.msg.descr.fail')
  })
})
