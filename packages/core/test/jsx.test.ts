import { describe, expect, test } from 'vitest'
import { hTs } from '../src/utils/jsx'

describe('JSX hTs', () => {
  test('creates text message', () => expect(hTs('text', {}, 'hello ', 'world').toString(false)).toBe('hello world'))

  test('creates mention and image messages', () => {
    expect(hTs('mention', { userId: '12345' }).toString(false)).toBe('@12345')
    expect(hTs('image', { src: 'https://example.com/a.png' }).toString(false)).toBe('[Image]')
  })

  test('creates composite seg message', () =>
    expect(hTs('seg', {}, hTs('mention', { userId: '1000' }), hTs('text', {}, ' welcome')).toString(false)).toBe('@1000 welcome'))

  test('throws on unknown element', () => expect(() => hTs('unknown_elem', {})).toThrowError('Unknown element type: unknown_elem'))
})
