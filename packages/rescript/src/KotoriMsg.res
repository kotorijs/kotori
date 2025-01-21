type element = Jsx.element

type component<'props> = Jsx.component<'props>

@scope("globalThis")
external jsx: (component<'props>, 'props) => element = "kotoriHRes"

@scope("globalThis")
external jsxs: (component<'props>, 'props) => element = "kotoriHRes"

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

  @scope("globalThis")
  external jsx: (string, props) => Jsx.element = "kotoriHRes"

  external someElement: element => option<element> = "%identity"
}
