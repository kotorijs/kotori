import { MessageList, MessageSingle, Messages } from 'kotori-bot'
import { describe, expect, test } from 'vitest'
import { MEDIA_KEY, REPLY_KEY } from '../src/constants'
import { QQElements } from '../src/elements'
import { FileType } from '../src/types'

describe('QQ Elements', () => {
  // biome-ignore lint: *
  const elements = new QQElements({} as any)

  test('decode text and mentions', () => {
    expect(elements.decode('hello')).toBe('hello')
    expect(elements.decode(new MessageSingle('text', { text: 'world' }))).toBe('world')
    expect(elements.decode(new MessageSingle('mention', { userId: '123456' }))).toBe('<@123456>')
    expect(elements.decode(new MessageSingle('mentionAll', {}))).toBe('@everyone')
  })

  test('decode reply and media metadata', () => {
    const list = Messages(
      new MessageSingle('reply', { messageId: 'msg-999' }),
      new MessageSingle('text', { text: 'check this' }),
      new MessageSingle('image', { content: 'https://example.com/test.png' }),
      new MessageSingle('file', { content: 'https://example.com/test.zip' })
    )

    const text = elements.decode(list)
    expect(text).toBe('check this')

    const replyId = Reflect.getMetadata(REPLY_KEY, list)
    expect(replyId).toBe('msg-999')

    const media = Reflect.getMetadata(MEDIA_KEY, list)
    expect(media).toEqual([
      { type: FileType.IMAGE, value: 'https://example.com/test.png' },
      { type: FileType.FILE, value: 'https://example.com/test.zip' }
    ])
  })

  test('parseQQMessage parses text, reply, and attachments', () => {
    const raw = {
      content: '<@!bot123> hello world',
      message_reference: { message_id: 'ref-001' },
      attachments: [
        {
          url: '//example.com/photo.jpg',
          content_type: 'image/jpeg',
          filename: 'photo.jpg'
        },
        {
          url: 'https://example.com/sound.mp3',
          content_type: 'audio/mp3',
          filename: 'sound.mp3'
        },
        {
          url: 'https://example.com/doc.pdf',
          content_type: 'application/pdf',
          filename: 'doc.pdf'
        }
      ]
    }

    const { message, messageAlt } = elements.parseQQMessage(raw)
    expect(messageAlt).toContain('hello world')
    expect(messageAlt).toContain('[图片]')
    expect(messageAlt).toContain('[语音]')
    expect(messageAlt).toContain('[文件: doc.pdf]')

    expect(message instanceof MessageList).toBe(true)
    const segments = Array.from(message as MessageList)
    expect(segments).toHaveLength(5)
    expect(segments[0].data).toEqual({ type: 'reply', messageId: 'ref-001' })
    expect(segments[1].data).toEqual({ type: 'text', text: 'hello world' })
    expect(segments[2].data).toEqual({ type: 'image', content: 'https://example.com/photo.jpg' })
    expect(segments[3].data).toEqual({ type: 'voice', content: 'https://example.com/sound.mp3' })
    expect(segments[4].data).toEqual({ type: 'file', content: 'https://example.com/doc.pdf' })
  })
})
