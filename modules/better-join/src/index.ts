import { Context, EventCallback, getRandomInt, stringTemp } from 'kotori-bot';
import data from './data';

export class Main {
  public constructor(Ctx: Context) {
    Ctx.on('group_increase', data => Main.handle(data));
  }

  private static handle: EventCallback<'group_increase'> = session => {
  const standard = getRandomInt(1, 2)
    for (let init = 0; init < standard; init += 1) {
      session.send(stringTemp(data[getRandomInt(0, Object.keys(data).length)], { at: session.el.at(session.userId) }));
    }
  };
}

export default Main;
