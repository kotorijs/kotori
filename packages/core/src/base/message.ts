import Tsu from 'tsukiko';
import { none, obj, stringRightSplit, stringTemp } from '@kotori-bot/tools';
import {
  CommandAccess,
  CommandConfig,
  MessageRaw,
  MessageScope,
  EventDataMsg,
  EventsList,
  MidwareStack,
  RegexpStack,
  MidwareCallback,
  RegexpCallback
} from '../types';
import Modules from './modules';
import type Api from '../components/api';
import Command from './command';
import { CommandError } from '../utils/errror';
import CommandExtra from '../utils/commandExtra';

export class Message extends Modules {
  protected readonly midwareStack: MidwareStack[] = [];

  protected readonly commandStack = Command.dataList;

  protected readonly regexpStack: RegexpStack[] = [];

  private handleMessageEvent(session: EventDataMsg) {
    /* Handle middle wares */
    let isPass = true;
    const midwareStack = Object.create(this.midwareStack);
    let lastMidwareNum = -1;
    while (midwareStack.length > 0) {
      if (lastMidwareNum === midwareStack.length) {
        isPass = false;
        break;
      }
      lastMidwareNum = midwareStack.length;
      session.quick(midwareStack[0].callback(() => midwareStack.shift(), session));
    }
    this.emit('midwares', { isPass, event: session });
  }

  private async handleMidwaresEvent(session: EventsList['midwares']) {
    const { isPass, event } = session;
    event.api.adapter.status.receivedMsg += 1;
    if (!isPass) return;

    /* Handle regexp */
    this.regexpStack.forEach((element) => {
      const match = event.message.match(element.match);
      if (!match) return;
      event.quick(element.callback(match, event));
    });

    /* Handle command */
    const params = [event.message, event.api.adapter.config['command-prefix']];
    if (!params[0].startsWith(params[1])) return;
    const commonParams = {
      event,
      command: stringRightSplit(params[0], params[1])
    };
    this.emit('before_parse', commonParams);
    let isCancel = false;
    const cancel = () => {
      isCancel = true;
    };
    const commandParams = {
      scope: event.type === 'group_msg' ? 'group' : ('private' as MessageScope),
      access: event.userId === event.api.adapter.config.master ? CommandAccess.ADMIN : CommandAccess.MEMBER
    };
    this.emit('before_command', { cancel, ...commonParams, ...commandParams });
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

  protected registeMessageEvent() {
    this.on('midwares', (session) => this.handleMidwaresEvent(session));
    this.on('group_msg', (session) => this.handleMessageEvent(session));
    this.on('private_msg', (session) => this.handleMessageEvent(session));
    this.before('send', (session) => {
      const { api } = session;
      api.adapter.status.sentMsg += 1;
    });
  }

  midware(callback: MidwareCallback, priority: number = 100) {
    if (this.midwareStack.filter((Element) => Element.callback === callback).length) return false;
    this.midwareStack.push({ callback, priority });
    this.midwareStack.sort((first, second) => first.priority - second.priority);
    return true;
  }

  command(template: string, config?: CommandConfig) {
    none(this);
    return new Command(template, config);
  }

  regexp(match: RegExp, callback: RegexpCallback) {
    if (this.regexpStack.filter((Element) => Element.match === match).length) return false;
    this.regexpStack.push({ match, callback });
    return true;
  }

  boardcast(type: MessageScope, message: MessageRaw) {
    const send =
      type === 'private'
        ? (api: Api) => api.send_private_msg(message, 1)
        : (api: Api) => api.send_group_msg(message, 1);
    /* this need support of database... */
    Object.values(this.botStack).forEach((apis) => {
      /* feating... */
      apis.forEach((api) => send(api));
    });
  }

  notify(message: MessageRaw) {
    const mainAdapterIdentity = Object.keys(this.config.adapter)[0];
    Object.values(this.botStack).forEach((apis) =>
      apis.forEach((api) => {
        if (api.adapter.identity !== mainAdapterIdentity) return;
        api.send_private_msg(message, api.adapter.config.master);
      })
    );
  }
}

export default Message;
