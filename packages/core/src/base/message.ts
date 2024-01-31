import Tsu from 'tsukiko';
import { none, stringRightSplit } from '@kotori-bot/tools';
import { Context, Symbols } from '../context';
import type {
  CommandAction,
  CommandConfig,
  EventDataMsg,
  EventsList,
  MessageScope,
  MidwareCallback,
  RegexpCallback
} from '../types';
import { disposeFactory } from '../utils/factory';

interface MidwareData {
  callback: MidwareCallback;
  priority: number;
}

interface RegexpData {
  match: RegExp;
  callback: RegexpCallback;
}

export class Message {
  readonly [Symbols.midware]: Set<MidwareData> = new Set();

  readonly [Symbols.command]: Set<[CommandAction]> = new Set();

  readonly [Symbols.regexp]: Set<RegexpData> = new Set();

  private handleMessageEvent(session: EventDataMsg) {
    /* Handle middle wares */
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

  private async handleMidwaresEvent(session: EventsList['midwares']) {
    const { isPass, event } = session;
    event.api.adapter.status.receivedMsg += 1;
    if (!isPass) return;

    /* Handle regexp */
    this[Symbols.regexp].forEach((data) => {
      const match = event.message.match(data.match);
      if (!match) return;
      event.quick(data.callback(match, event));
    });

    /* Handle command */
    const params = [
      event.message,
      event.api.adapter.config['command-prefix'] ?? this.ctx.config.global['command-prefix']
    ];
    if (!params[0].startsWith(params[1])) return;
    const commonParams = {
      event,
      command: stringRightSplit(params[0], params[1])
    };
    this.ctx.emit('before_parse', commonParams);
    let isCancel = false;
    const cancel = () => {
      isCancel = true;
    };
    const commandParams = {
      scope: event.type === 'group_msg' ? 'group' : ('private' as MessageScope),
      access: event.userId === event.api.adapter.config.master ? CommandAccess.ADMIN : CommandAccess.MEMBER
    };
    this.ctx.emit('before_command', { cancel, ...commonParams, ...commandParams });
    if (isCancel) return;
    try {
      Command.parse(commonParams.command);
    } catch (err) {
      if (!(err instanceof CommandError) || !(err.extra instanceof CommandExtra)) throw err;
      const parseResult = err.extra.value;
      const isSuccessParsed = parseResult.type === 'parsed';
      this.emit('parse', { result: parseResult, ...commonParams, cancel });
      if (isCancel) return;
      if (!isSuccessParsed) throw err;
      try {
        const executedResult = await parseResult.action(
          { args: parseResult.args, options: parseResult.options },
          event
        );
        if (Tsu.Object({}).index(Tsu.Unknown()).check(executedResult)) {
          this.emit('command', { result: executedResult, ...commonParams, ...commandParams });
          return;
        }
        const objectTemp = (obj: obj<string | number | void>) => {
          const result = obj;
          Object.keys(result).forEach((key) => {
            if (!result[key] || typeof result[key] !== 'string') return;
            result[key] = event.i18n.locale(result[key] as string);
          });
          return result;
        };
        const returnHandle = Array.isArray(executedResult)
          ? stringTemp(event.i18n.locale(executedResult[0]), objectTemp(executedResult[1]))
          : event.i18n.locale(executedResult ?? '');
        this.emit('command', {
          result: { type: 'success', return: returnHandle ?? undefined },
          ...commonParams,
          ...commandParams
        });
        if (returnHandle) event.send(returnHandle);
      } catch (executeErr) {
        this.emit('command', {
          result: { type: 'error', error: executeErr },
          ...commonParams,
          ...commandParams
        });
      }
    }
  }

  private ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
    this.ctx.on('midwares', (session) => this.handleMidwaresEvent(session));
    this.ctx.on('group_msg', (session) => this.handleMessageEvent(session));
    this.ctx.on('private_msg', (session) => this.handleMessageEvent(session));
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
    // this[Symbols.midware].add((first, second) => first.priority - second.priority);
  }

  command(template: string, config?: CommandConfig) {
    none(this);
    return new Command(template, config);
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
