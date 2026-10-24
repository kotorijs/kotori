import { describe, expect, test } from 'vitest'
import { Context } from '../src/app'
import { Symbols } from '../src/global'
import { Container } from '../src/utils/container'

describe('Core Container', () => {
  test('throws if instance is not set', () =>
    expect(() => Container[Symbols.getInstance]()).toThrowError('Default context instance is not set'))

  test('sets and gets default instance correctly', () => {
    const ctx = new Context()
    Container[Symbols.setInstance](ctx)
    expect(Container[Symbols.getInstance]()).toBe(ctx)
    expect(() => Container[Symbols.setInstance](ctx)).toThrowError('Default context instance is already set')
  })
})
