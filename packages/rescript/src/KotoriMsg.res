type element = Jsx.element

type component<'props> = Jsx.component<'props>

@module("@kotori-bot/core")
external jsx: (component<'props>, 'props) => element = "hRes"

@module("@kotori-bot/core")
external jsxs: (component<'props>, 'props) => element = "hRes"

external array: array<element> => element = "%identity"

module Elements = {
  type props = {
    children?: JsxU.element,
    userId?: string,
    messageId?: string,
    title?: string,
    content?: string,
    latitude?: float,
    longitude?: float,
    src?: string,
  }

  @module("@kotori-bot/core")
  external jsx: (string, props) => Jsx.element = "hRes"

  external someElement: element => option<element> = "%identity"
}
