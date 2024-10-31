let inject = ["browser"]

let main = (ctx: Kotori.context) => {
  open Kotori.Msg

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
    <Text>
      {switch res->Type.typeof {
      | #string => session.format("Greet: \n{0}", [res->Kotori.Utils.toAny])
      | _ => "Sorry, I cannot get a greeting right now."
      }}
    </Text>
  })
  ->ctx.cmd_help("Get a greeting from hotaru.icu")
  ->ctx.cmd_scope(#all)
  ->ctx.cmd_alias(["hi", "hey", "hello"])
  ->ignore

  "res [saying=functional]"
  ->ctx.cmd_new
  ->ctx.cmd_action(async ({args}, session) => {
    let userId = switch session.userId {
    | Some(userId) => userId
    | None => "Unknown"
    }
    <Seg>
      <Text> {"Hello "} </Text>
      <Mention userId />
      <Br />
      <Text>
        {switch args {
        | [String(saying)] => session.format("Greet: \n{0}", [saying])
        | _ => "Sorry, I cannot get a greeting right now."
        }}
      </Text>
      <Seg>
        <Text> {"he is a example image"} </Text>
        <Image src="https://i.imgur.com/y5y5y5.png" />
      </Seg>
    </Seg>
  })
  ->ignore
}
