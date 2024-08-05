import { Messages, type Context, type EventsList } from 'kotori-bot'
import data from './data'
import { randomInt } from 'node:crypto'

export class Main {
  public constructor(ctx: Context) {
    ctx.on('on_group_increase', (data) => this.handle(data))
    ctx.on('on_group_decrease', (data) => this.handle(data))
  }

  protected handle(session: EventsList['on_group_increase']) {
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
