let s = "Hello, world!"
type readline

external on: @string
[
  | #close(unit => unit)
  | #line(string => unit)
] => unit = "on"

on(#close(event => ()))
on(#line(line => Js.log(line)))
