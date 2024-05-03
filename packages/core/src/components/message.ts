import { stringRightSplit } from '@kotori-bot/tools';
import { type Context, type EventsList } from 'fluoro';
import { type CommandConfig, type MidwareCallback, type RegexpCallback, SessionData } from '../types';
import { cancelFactory, disposeFactory } from '../utils/factory';
import { Command } from '../utils/command';
import CommandError from '../utils/commandError';
import { Symbols } from '../global';

interface MidwareData {
  callback: MidwareCallback;
  priority: number;
}

interface RegexpData {
  match: RegExp;
  callback: RegexpCallback;
}

export class Message {
  public readonly [Symbols.midware]: Set<MidwareData> = new Set();

  public readonly [Symbols.command]: Set<Command> = new Set();

  public readonly [Symbols.regexp]: Set<RegexpData> = new Set();

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
      raw: stringRightSplit(session.message, prefix)
    };
    this.ctx.emit('before_parse', params);
    const cancel = cancelFactory();
    this.ctx.emit('before_command', { cancel: cancel.get(), ...params });
    if (cancel.value) return;

    let matched: undefined | Command;
    this[Symbols.command].forEach(async (cmd) => {
      if (matched || !cmd.meta.action) return;
      const result = Command.run(params.raw, cmd.meta);
      if (result instanceof CommandError && result.value.type === 'unknown') return;
      matched = cmd;
      this.ctx.emit('parse', { command: cmd, result, ...params, cancel: cancel.get() });
      if (cancel.value || result instanceof CommandError) return;
      try {
        const executed = await cmd.meta.action({ args: result.args, options: result.options }, session);
        if (executed instanceof CommandError) {
          this.ctx.emit('command', { command: cmd, result: executed, ...params });
          return;
        }
        if (executed !== undefined) session.quick(executed);
        this.ctx.emit('command', {
          command: cmd,
          result: executed instanceof CommandError ? result : executed,
          ...params
        });
      } catch (error) {
        this.ctx.emit('command', {
          command: matched,
          result: new CommandError({ type: 'error', error }),
          ...params
        });
      }
    });

    if (matched) return;
    this.ctx.emit('parse', {
      command: new Command(''),
      result: new CommandError({ type: 'unknown', input: params.raw }),
      ...params,
      cancel: cancel.get()
    });
  }

  private readonly ctx: Context;

  public constructor(ctx: Context) {
    this.ctx = ctx;
    this.ctx.on('on_message', (session) => this.handleMidware(session));
    this.ctx.on('midwares', (data) => this.handleCommand(data));
    this.ctx.on('midwares', (data) => this.handleRegexp(data));
    this.ctx.on('before_send', (data) => {
      const { api } = data;
      api.adapter.status.sentMsg += 1;
    });
  }

  public midware(callback: MidwareCallback, priority: number = 100) {
    const data = { callback, priority };
    this[Symbols.midware].add(data);
    const dispose = () => this[Symbols.midware].delete(data);
    disposeFactory(this.ctx, dispose);
    return dispose;
  }

  public command(template: string, config?: CommandConfig) {
    const command = new Command(template, config);
    this[Symbols.command].add(command);
    const dispose = () => this[Symbols.command].delete(command);
    disposeFactory(this.ctx, dispose);
    return command;
  }

  public regexp(match: RegExp, callback: RegexpCallback) {
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
