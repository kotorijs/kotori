import { obj, stringRightSplit, stringTemp } from '@kotori-bot/tools';
import I18n from '@kotori-bot/i18n';
import { Context, Symbols } from '../context';
import {
  CommandAccess,
  type CommandConfig,
  type EventsList,
  type MidwareCallback,
  type RegexpCallback,
  SessionData
} from '../types';
import { cancelFactory, disposeFactory } from '../utils/factory';
import { Command } from '../utils/command';
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

  private handleMidware(session: SessionData) {
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
    this.ctx.emit('midwares', { isPass, session });
  }

  private async handleRegexp(data: EventsList['midwares']) {
    const { session } = data;
    if (!data.isPass) return;
    this[Symbols.regexp].forEach((data) => {
      const match = session.message.match(data.match);
      if (!match) return;
      session.quick(data.callback(match, session));
    });
  }

  private handleCommand(data: EventsList['midwares']) {
    const { session } = data;
    const prefix = session.api.adapter.config['command-prefix'] ?? this.ctx.config.global['command-prefix'];
    if (!session.message.startsWith(prefix)) return;
    const params = {
      session,
      command: stringRightSplit(session.message, prefix)
    };
    this.ctx.emit('before_parse', params);
    const cancel = cancelFactory();
    const cmdParams = {
      scope: session.type,
      access: session.userId === session.api.adapter.config.master ? CommandAccess.ADMIN : CommandAccess.MEMBER
    };
    this.ctx.emit('before_command', { cancel: cancel.get(), ...params, ...cmdParams });
    if (cancel.value) return;
    let matched = false;
    this[Symbols.command].forEach(async (cmd) => {
      if (matched || !cmd.meta.action) return;
      const result = Command.run(params.command, cmd.meta);
      if (result instanceof CommandError && result.value.type === 'unknown') return;
      matched = true;
      this.ctx.emit('parse', { result, ...params, cancel: cancel.get() });
      if (cancel.value || result instanceof CommandError) return;
      try {
        const executed = await cmd.meta.action({ args: result.args, options: result.options }, session);
        if (executed instanceof CommandError) {
          this.ctx.emit('command', { result, ...params, ...cmdParams });
          return;
        }
        if (executed !== undefined) {
          session.send(
            Array.isArray(executed)
              ? stringTemp(
                  session.i18n.locale(executed[0]),
                  objectTempFactory(session.i18n)(executed[1] as obj<string>)
                )
              : session.i18n.locale(executed)
          );
        }
        this.ctx.emit('command', {
          result: executed instanceof CommandError ? result : executed,
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
    this.ctx.on('on_message', (data) => this.handleMidware(data));
    this.ctx.on('midwares', (data) => this.handleCommand(data));
    this.ctx.on('midwares', (data) => this.handleRegexp(data));
    this.ctx.on('before_send', (data) => {
      const { api } = data;
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
  //       ? (api: Api) => api.send_on_message(message, 1)
  //       : (api: Api) => api.send_on_message(message, 1);
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
  //       api.send_on_message(message, api.adapter.config.master);
  //     })
  //   );
  // }
}

export default Message;