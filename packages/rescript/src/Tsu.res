type parser

@module("@kotori-bot/core") @scope("Tsu")
external string: unit => parser = "String"

@module("@kotori-bot/core") @scope("Tsu")
external number: unit => parser = "Number"

let int = (): parser => {
  let parser = number()
  Kotori.Utils.toAny(parser)["int"]()
}

@module("@kotori-bot/core") @scope("Tsu")
external boolean: unit => parser = "Boolean"

@module("@kotori-bot/core") @scope("Tsu")
external null: unit => parser = "Null"

@module("@kotori-bot/core") @scope("Tsu")
external array: parser => parser = "Array"

@module("@kotori-bot/core") @scope("Tsu")
external tuple: array<parser> => parser = "Tuple"

@module("@kotori-bot/core") @scope("Tsu")
external object: Js.Dict.t<parser> => parser = "Object"

@module("@kotori-bot/core") @scope("Tsu")
external custom: ('a => bool) => parser = "Custom"

type result<'a> = Success('a) | Failure(string)

let parse = (parser: parser, input: 'a): 'a => {
  Kotori.Utils.toAny(parser)["parse"](input)
}

let parseSafe = (parser: parser, input: 'a): result<'a> => {
  let result = input->Kotori.Utils.toAny(parser)["parseSafe"]
  if result["value"] == true {
    Success(result["data"])
  } else {
    Failure(result["error"]["toString"]())
  }
}

let check = (parser: parser, input: 'a): bool => {
  Kotori.Utils.toAny(parser)["check"](input)
}

let default = (parser: parser, defaultValue: 'a): parser => {
  Kotori.Utils.toAny(parser)["default"](defaultValue)
}

let optional = (parser: parser): parser => {
  Kotori.Utils.toAny(parser)["optional"]()
}

let empty = (parser: parser): parser => {
  Kotori.Utils.toAny(parser)["empty"]()
}

let describe = (parser: parser): parser => {
  Kotori.Utils.toAny(parser)["describe"]()
}

let title = (parser: parser, title: string): parser => {
  Kotori.Utils.toAny(parser)["title"](title)
}

let min = (parser: parser, min: float): parser => {
  let parser = Kotori.Utils.toAny(parser)
  if parser["min"] {
    parser["min"](min)
  } else {
    parser
  }
}

let max = (parser: parser, max: float): parser => {
  let parser = Kotori.Utils.toAny(parser)
  if parser["max"] {
    parser["max"](max)
  } else {
    parser
  }
}

let range = (parser: parser, min: float, max: float): parser => {
  let parser = Kotori.Utils.toAny(parser)
  if parser["range"] {
    parser["range"](min, max)
  } else {
    parser
  }
}
