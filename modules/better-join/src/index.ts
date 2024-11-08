import { Messages, type Context, type EventsList, Message } from 'kotori-bot'
import data from './data'
import { randomInt } from 'node:crypto'

export class Main {
  public constructor(ctx: Context) {
    ctx.on('on_group_increase', async (session) => {
      const config = {
        times: 7,
        duration: 120,
        steps: 3,
        minNum: 1,
        maxNum: 10
      }
      const [expr, result] = ['', 2]
      const start = Date.now()
      const checker = async (count: number) => {
        if (count >= config.times) {
          session.quick('答案是' + result + '。')
          return
        }
        if (Date.now() - start >= config.duration * 1000) {
          session.quick('时间已到，答案是' + result + '。')
          return
        }
        if (Number(await session.prompt('请输入答案：')) === result) session.quick('正确！')
        else checker(count + 1)
      }
      session.quick('欢迎新人！请猜一下下面这个数是多少：' + expr)
      checker(0)
    })
    ctx.on('on_group_increase', (data) => this.groupIncrease(data))
    ctx.on('on_group_decrease', (data) => this.groupDecrease(data))
  }

  protected groupIncrease(session: EventsList['on_group_increase']) {
    const standard = randomInt(1, 3)
    for (let init = 0; init < standard; init += 1) {
      session.quick([data[randomInt(0, Object.keys(data).length)], [Messages.mention(session.userId)]])
    }
  }

  protected groupDecrease(session: EventsList['on_group_decrease']) {
    session.quick([
      session.userId === session.operatorId ? '{0} 默默地退出了群聊' : '{0} 被 {1} 制裁了...',
      [session.userId, session.operatorId]
    ])
  }
}

export default Main
