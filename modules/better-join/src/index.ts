import { Context, EventsList, getRandomInt } from 'kotori-bot';
import data from './data';

export class Main {
  public constructor(ctx: Context) {
    ctx.on('on_group_increase', (data) => Main.handle(data));
  }

  private static handle(session: EventsList['on_group_increase']) {
    const standard = getRandomInt(0, 2);
    for (let init = 0; init < standard; init += 1) {
      session.send(
        session.format(data[getRandomInt(0, Object.keys(data).length)], { at: session.el.at(session.userId) })
      );
    }
  }
}

export default Main;
