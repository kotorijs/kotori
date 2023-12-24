import { Context, EventCallback, getRandomInt, stringTemp } from 'kotori-bot';
import data from './data';

export class Main {
  public constructor(Ctx: Context) {
    Ctx.on('group_increase', data => Main.handle(data));
  }

  private static handle: EventCallback<'group_increase'> = session => {
    for (let init = 0; init < getRandomInt(2); init += 1) {
      session.send(stringTemp(data[init], { at: session.el.at(session.userId) }));
    }
  };
}

export default Main;
