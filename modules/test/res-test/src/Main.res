open Kotori
open Msg
open Ctx
open Session
open Bot

let inject = ["browser"]

@val external setTimeout: (unit => unit, int) => float = "setTimeout"

type config = {
  times: int,
  duration: int,
  steps: int,
  minNum: int,
  maxNum: int,
}

let config =
  [
    ("times", Tsu.int()->Tsu.default(7)),
    ("duration", Tsu.int()->Tsu.default(180)),
    ("steps", Tsu.int()->Tsu.default(3)),
    ("minNum", Tsu.int()->Tsu.default(1)),
    ("maxNum", Tsu.int()->Tsu.default(10)),
  ]
  ->Dict.fromArray
  ->Tsu.object

let main = (ctx: context, config: config) => {
  ctx
  ->Cmd.make("greet - get a greeting")
  ->Cmd.action_async(async (_, session) => {
    let res = await "http://hotaru.icu/api/hitokoto/v2?format=text"->ctx.http.get
    <Text>
      {switch res->Type.typeof {
      | #string => session->format("Greet: \n{0}", [res->Kotori.Utils.toAny])
      | _ => "Sorry, I cannot get a greeting right now."
      }}
    </Text>
  })
  ->Cmd.help("Get a greeting from hotaru.icu")
  ->Cmd.scope(#all)
  ->Cmd.alias(["hi", "hey", "hello"])
  ->ignore

  ctx
  ->Cmd.make("res [saying=functional]")
  ->Cmd.action_async(async ({args}, session) => {
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
        | [String(saying)] => session->format("Greet: \n{0}", [saying])
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

  let onGroupIncreaseHandler = async (session: session) => {
    let at = <Mention userId={session->get_user_id_unwarp} />

    let (expr, result) = Expr.generateAndCalculate(config.steps, config.minNum, config.maxNum)
    let kick = () =>
      switch (session.groupId, session.userId) {
      | (Some(groupId), Some(userId)) => session.api->setGroupKick(groupId, userId)->ignore
      | _ => ()
      }

    let timerId = Js.Global.setTimeout(() => {
      session
      ->quick(
        <Seg>
          {at}
          <Text> {`回答超时，答案是${result->Belt.Int.toString}。`} </Text>
        </Seg>,
      )
      ->ignore
      kick()
    }, config.duration * 1000)
    let start = Js.Date.now()

    let rec checker = async (count: int) => {
      if count >= config.times {
        session
        ->quick(
          <Seg>
            {at}
            <Text> {`回答次数达到上限，答案是${result->Belt.Int.toString}。`} </Text>
          </Seg>,
        )
        ->ignore
        kick()
      } else if Js.Date.now() -. start >= config.duration->Belt.Float.fromInt *. 1000.0 {
        ()
      } else {
        let answer = await session->prompt(
          <Seg>
            {at}
            <Text>
              {`剩余时间 ${(config.duration -
                (Js.Date.now()->Belt.Int.fromFloat / 1000 -
                start->Belt.Int.fromFloat / 1000))
                  ->Belt.Int.toString} 秒，剩余次数 ${(config.times - count)
                  ->Belt.Int.toString} 次。`}
            </Text>
            <Br />
            <Text> {`请输入答案：`} </Text>
          </Seg>,
        )
        switch answer->Belt.Int.fromString {
        | Some(num) if num === result => {
            await session->quick(
              <Seg>
                {at}
                <Text> {`回答正确，危机解除！`} </Text>
              </Seg>,
            )
            Js.Global.clearTimeout(timerId)
          }
        | _ => await checker(count + 1)
        }
      }
    }

    await session->quick(
      <Seg>
        {at}
        <Text>
          {` 请在 ${config.duration->Belt.Int.toString} 秒内发送以下数学表达式的结果，共有 ${config.times->Belt.Int.toString} 次机会：`}
        </Text>
        <Br />
        <Text> {expr} </Text>
        <Br />
        <Text> {"1.回答超时或错误次数达到上限时，将自动踢出群组。"} </Text>
        <Br />
        <Text>
          {"2.若结果为小数，请直接舍弃小数部分发送整数（如：π -> 3）。"}
        </Text>
      </Seg>,
    )
    await checker(0)
  }

  ctx->on(
    #on_group_increase(
      async session => {
        switch session.userId {
        | Some(userId)
          if userId !== session.api.adapter.selfId && session.groupId === Some("317691609") =>
          await onGroupIncreaseHandler(session)
        | _ => ()
        }
      },
    ),
  )
}
