import { obj, stringRightSplit, stringTemp } from '@kotori-bot/tools';
import I18n from '@kotori-bot/i18n';
import { Context, Symbols } from '../context';
import {
  CommandAccess,
  type CommandConfig,
  type EventDataMsg,
  type EventsList,
  type MessageScope,
  type MidwareCallback,
  type RegexpCallback
} from '../types';
import { cancelFactory, disposeFactory } from '../utils/factory';
import { Command } from '../service';
import CommandError from '../utils/commandError';

interface MidwareData {
  callback: MidwareCallback;
  priority: number;
}

interface RegexpData {
  match: RegExp;
  callback: RegexpCallback;
}

function objectTempFactory(i18n: I18n) {
  return (obj: obj<string | number>) => {
    const result = obj;
    Object.keys(result).forEach((key) => {
      if (!result[key] || typeof result[key] !== 'string') return;
      result[key] = i18n.locale(result[key] as string);
    });
    return result;
  };
}

export class Message {
  readonly [Symbols.midware]: Set<MidwareData> = new Set();

  readonly [Symbols.command]: Set<Command> = new Set();

  readonly [Symbols.regexp]: Set<RegexpData> = new Set();

  private handleMidware(session: EventDataMsg) {
    const { api } = session;
    api.adapter.status.receivedMsg += 1;
    let isPass = true;
    let midwares: MidwareData[] = [];
    this[Symbols.midware].forEach((val) => midwares.push(val));
    midwares = midwares.sort((first, second) => first.priority - second.priority);
    let lastMidwareNum = -1;
    while (midwares.length > 0) {
      if (lastMidwareNum === midwares.length) {
        isPass = false;
        break;
      }
      lastMidwareNum = midwares.length;
      session.quick(midwares[0].callback(() => midwares.shift(), session));
    }
    this.ctx.emit('midwares', { isPass, event: session });
  }

  private async handleRegexp(session: EventsList['midwares']) {
    const { event } = session;
    if (!session.isPass) return;
    this[Symbols.regexp].forEach((data) => {
      const match = event.message.match(data.match);
      if (!match) return;
      event.quick(data.callback(match, event));
    });
  }

  private handleCommand(session: EventsList['midwares']) {
    const { event } = session;
    const prefix = event.api.adapter.config['command-prefix'] ?? this.ctx.config.global['command-prefix'];
    if (!event.message.startsWith(prefix)) return;
    const params = {
      event,
      command: stringRightSplit(event.message, prefix)
    };
    this.ctx.emit('before_parse', params);
    const cancel = cancelFactory();
    const cmdParams = {
      scope: (event.type === 'group_msg' ? 'group' : 'private') as MessageScope,
      access: event.userId === event.api.adapter.config.master ? CommandAccess.ADMIN : CommandAccess.MEMBER
    };
    this.ctx.emit('before_command', { cancel: cancel.get(), ...params, ...cmdParams });
    if (cancel.value) return;
    let matched = false;
    this[Symbols.command].forEach(async (cmd) => {
      if (matched || !cmd.meta.action) return;
      matched = true;
      const result = Command.run(params.command, cmd.meta);
      this.ctx.emit('parse', { result, ...params, cancel: cancel.get() });
      if (cancel.value || result instanceof CommandError) return;
      try {
        const executed = await cmd.meta.action({ args: result.args, options: result.options }, event);
        if (executed instanceof CommandError) {
          this.ctx.emit('command', { result, ...params, ...cmdParams });
          return;
        }
        if (executed !== undefined) {
          event.send(
            Array.isArray(executed)
              ? stringTemp(event.i18n.locale(executed[0]), objectTempFactory(event.i18n)(executed[1] as obj<string>))
              : event.i18n.locale(executed)
          );
        }
        this.ctx.emit('command', {
          result: executed instanceof CommandError ? result : new CommandError({ type: 'success' }),
          ...params,
          ...cmdParams
        });
      } catch (error) {
        this.ctx.emit('command', {
          result: new CommandError({ type: 'error', error }),
          ...params,
          ...cmdParams
        });
      }
    });
    if (matched) return;
    this.ctx.emit('parse', {
      result: new CommandError({ type: 'unknown', input: params.command }),
      ...params,
      cancel: cancel.get()
    });
  }

  private readonly ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
    this.ctx.on('private_msg', (session) => this.handleMidware(session));
    this.ctx.on('group_msg', (session) => this.handleMidware(session));
    this.ctx.on('midwares', (session) => this.handleCommand(session));
    this.ctx.on('midwares', (session) => this.handleRegexp(session));
    this.ctx.before('send', (session) => {
      const { api } = session;
      api.adapter.status.sentMsg += 1;
    });
  }

  midware(callback: MidwareCallback, priority: number = 100) {
    const data = { callback, priority };
    this[Symbols.midware].add(data);
    const dispose = () => this[Symbols.midware].delete(data);
    disposeFactory(this.ctx, dispose);
    return dispose;
  }

  command(template: string, config?: CommandConfig) {
    const command = new Command(template, config);
    this[Symbols.command].add(command);
    const dispose = () => this[Symbols.command].delete(command);
    disposeFactory(this.ctx, dispose);
    return command;
  }

  regexp(match: RegExp, callback: RegexpCallback) {
    const data = { match, callback };
    this[Symbols.regexp].add(data);
    const dispose = () => this[Symbols.regexp].delete(data);
    disposeFactory(this.ctx, dispose);
    return dispose;
  }

  // boardcast(type: MessageScope, message: MessageRaw) {
  //   const send =
  //     type === 'private'
  //       ? (api: Api) => api.send_private_msg(message, 1)
  //       : (api: Api) => api.send_group_msg(message, 1);
  //   /* this need support of database... */
  //   Object.values(this.botStack).forEach((apis) => {
  //     /* feating... */
  //     apis.forEach((api) => send(api));
  //   });
  // }

  // notify(message: MessageRaw) {
  //   const mainAdapterIdentity = Object.keys(this.config.adapter)[0];
  //   Object.values(this.botStack).forEach((apis) =>
  //     apis.forEach((api) => {
  //       if (api.adapter.identity !== mainAdapterIdentity) return;
  //       api.send_private_msg(message, api.adapter.config.master);
  //     })
  //   );
  // }
}

export default Message;
