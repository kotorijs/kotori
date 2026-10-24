import { MessageSingle } from 'kotori-bot'
import { describe, expect, test } from 'vitest'
import { escapeCq, OnebotElements, unescapeCq } from '../src/elements'

describe('OneBot Elements', () => {
  // biome-ignore lint: *
  const elements = new OnebotElements({} as any)

  test('escapes and unescapes CQ special characters', () => {
    expect(escapeCq('a&b[c]d,e')).toBe('a&amp;b&#91;c&#93;d,e')
    expect(escapeCq('a,b', true)).toBe('a&#44;b')
    expect(unescapeCq('a&amp;b&#91;c&#93;d&#44;e')).toBe('a&b[c]d,e')
  })

  test('decodes basic text and segments to CQ codes', () => {
    expect(elements.decode('hello [world]')).toBe('hello &#91;world&#93;')
    expect(elements.decode(new MessageSingle('mention', { userId: '123456' }))).toBe('[CQ:at,qq=123456]')
    expect(elements.decode(new MessageSingle('mentionAll', {}))).toBe('[CQ:at,qq=all]')
    expect(elements.decode(new MessageSingle('image', { content: 'https://ex.com/a.png' }))).toBe(
      '[CQ:image,file=https://ex.com/a.png,cache=0]'
    )
  })

  test('encodes CQ code string to structured Message segments', () => {
    const msg = elements.encode('hi [CQ:at,qq=123456] look [CQ:image,file=http://ex.com/p.jpg]')
    expect(Array.isArray(msg)).toBe(true)
    // biome-ignore lint: *
    const list = Array.from(msg as any)
    expect(list).toHaveLength(4)
    expect(list[0].data).toEqual({ type: 'text', text: 'hi ' })
    expect(list[1].data).toEqual({ type: 'mention', userId: '123456' })
    expect(list[2].data).toEqual({ type: 'text', text: ' look ' })
    expect(list[3].data).toEqual({ type: 'image', content: 'http://ex.com/p.jpg' })
  })
})
