import { MessageList, MessageSingle, Messages } from '../components/messages'

declare namespace JSX {
  type Node = string | number | boolean | null | undefined | Element | Node[]
  type Element =
    | import('../components/messages').MessageList<keyof import('../types/message').MessageMapping>
    | import('../components/messages').MessageSingle<keyof import('../types/message').MessageMapping>

  interface ElementAttributesProperty {
    // biome-ignore lint:
    props: any
  }

  interface ElementChildrenAttribute {
    children: unknown
  }

  interface IntrinsicElements {
    text: {
      children: string
    }
    br: never
    image: {
      src: string
    }
    reply: {
      messageId: string
    }
    mention: {
      userId: string
    }
    mentionAll: never
    video: {
      src: string
    }
    audio: {
      src: string
    }
    voice: {
      src: string
    }
    file: {
      src: string
    }
    location: {
      latitude: number
      longitude: number
      title: string
      content: string
    }
    seg: {
      children: Node
    }
  }
}

const Fragment = Symbol('Fragment')

export function h(
  type: string | typeof Fragment | ((props: Record<string, unknown>) => JSX.Element),
  props: Record<string, unknown>,
  // biome-ignore lint:
  ...children: any[]
): JSX.Element {
  if (type === Fragment) return h('list', props, ...children)
  if (typeof type === 'function') return type(Object.assign({}, props, { children }))
  const flattenedChildren = children
    .flat(Number.MAX_SAFE_INTEGER)
    .filter((child) => child != null && child !== false && child !== true)
  switch (type) {
    case 'text':
      return Messages.text(flattenedChildren.map((child) => String(child)).join(''))
    case 'mention':
      return Messages.mention((props as JSX.IntrinsicElements['mention']).userId)
    case 'mentionAll':
      return Messages.mentionAll()
    case 'reply':
      return Messages.reply((props as JSX.IntrinsicElements['reply']).messageId)
    case 'image':
      return Messages.image((props as JSX.IntrinsicElements['image']).src)
    case 'audio':
      return Messages.audio((props as JSX.IntrinsicElements['audio']).src)
    case 'video':
      return Messages.video((props as JSX.IntrinsicElements['video']).src)
    case 'file':
      return Messages.file((props as JSX.IntrinsicElements['file']).src)
    case 'location':
      // biome-ignore lint:
      const locationProps = props as JSX.IntrinsicElements['location']
      return Messages.location(
        locationProps.latitude,
        locationProps.longitude,
        locationProps.title,
        locationProps.content
      )
    case 'seg':
      return Messages(
        ...flattenedChildren.map((child) =>
          child instanceof MessageSingle || child instanceof MessageList
            ? child
            : child && typeof child === 'object' && 'type' in child
              ? h(child.type, child.props, child.children)
              : String(child)
        )
      )
    case 'br':
      return h('text', {}, '\n')
    default:
      throw new Error(`Unknown element type: ${type}`)
  }
}

export function hRes(type: string, props: Record<string, unknown>) {
  return h(
    type,
    props,
    ...('children' in props ? (Array.isArray(props.children) ? props.children : [props.children]) : [])
  )
}
