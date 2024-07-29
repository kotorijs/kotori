import type { Context, EventsList } from 'kotori-bot'
import data from './data'
import { randomInt } from 'node:crypto'

export class Main {
  public constructor(ctx: Context) {
    ctx.on('on_group_increase', (data) => this.handle(data))
  }

  protected handle(session: EventsList['on_group_increase']) {
    const standard = randomInt(0, 2)
    for (let init = 0; init < standard; init += 1) {
      session.quick([data[randomInt(0, Object.keys(data).length)], { at: session.el.mention(session.userId) }])
    }
  }
}

export default Main
