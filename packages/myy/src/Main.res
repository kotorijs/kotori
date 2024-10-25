let resHookerProps = [
  "loadExport",
  "unloadExport",
  "cmd_new",
  "cmd_action",
  "cmd_option",
  "cmd_help",
  "cmd_scope",
  "cmd_access",
  "cmd_alias",
  "cmd_shortcut",
  "cmd_hide",
]

let main = (ctx: Kotori.context) => {
  open Kotori.Msg

  let provideSucceed = ctx.provide("res_hooker", ctx->Kotori.createResHooker->Kotori.Utils.toAny)
  let mixinSucceed = ctx.mixin("res_hooker", resHookerProps, true)

  Console.log(
    if provideSucceed && mixinSucceed {
      "Res hooker is ready."
    } else {
      "Res hooker is not ready."
    },
  )

  ctx.loadExport({
    main: ctx2 => {
      let identity = switch ctx2.identity {
      | Some(identity) => identity
      | None => "Unknown"
      }
      Console.log(`Hello, world! from ${identity}`)
    },
  })

  "greet - get a greeting"
  ->ctx.cmd_new
  ->ctx.cmd_action(async (_, session) => {
    let res = await "http://hotaru.icu/api/hitokoto/v2?format=text"->ctx.http.get
    switch res->Type.typeof {
    | #string => session.format("Greet: \n{0}", [res->Kotori.Utils.toAny])
    | _ => "Sorry, I cannot get a greeting right now."
    }->text
  })
  ->ctx.cmd_help("Get a greeting from hotaru.icu")
  ->ctx.cmd_scope(#all)
  ->ctx.cmd_alias(["hi", "hey", "hello"])
  ->ignore

  "res [saying=functional]"
  ->ctx.cmd_new
  ->ctx.cmd_action(async ({args}, session) => {
    switch session.userId {
    | Some(userId) => Console.log(`User ID: ${userId}`)
    | None => Console.log("No user ID found")
    }
    switch args {
    | [String(saying)] => `Hello, ${saying} from rescript!`
    | _ => "Invalid arguments"
    }->text
  })
  ->ignore
}
