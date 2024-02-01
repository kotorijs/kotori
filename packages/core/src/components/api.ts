import { none } from '@kotori-bot/tools';
import type Adapter from './adapter';
import type { EventDataTargetId, MessageRaw } from '../types/index';
import Elements from './elements';

interface ApiImpl {
  readonly adapter: Adapter<this>;

  send_private_msg(message: MessageRaw, userId: EventDataTargetId): /* Promise<unknown> | */ void;

  send_group_msg(message: MessageRaw, groupId: EventDataTargetId): /* Promise<unknown> | */ void;

  delete_msg(messageId: EventDataTargetId): void;

  set_group_name(groupId: EventDataTargetId, groupName: string): void;

  set_group_avatar(groupId: EventDataTargetId, image: string): void;

  set_group_admin(groupId: EventDataTargetId, userId: EventDataTargetId, enable: boolean): void;

  set_group_card(groupId: EventDataTargetId, userId: EventDataTargetId, card: string): void;

  set_group_ban(groupId: EventDataTargetId, userId?: EventDataTargetId, time?: number): void;

  send_group_notice(groupId: EventDataTargetId, content: string, image?: string): void;

  set_group_kick(groupId: EventDataTargetId, userId: EventDataTargetId): void;

  set_group_leave(groupId: EventDataTargetId): void;

  elements: Elements;
}

export abstract class Api implements ApiImpl {
  readonly adapter: Adapter<this>;

  elements: Elements;

  constructor(adapter: Adapter, el: Elements) {
    this.adapter = adapter as Adapter<this>;
    this.elements = el;
  }

  send_private_msg(message: MessageRaw, userId: EventDataTargetId, extra?: unknown) {
    none(this, message, userId, extra);
  }

  send_group_msg(message: MessageRaw, groupId: EventDataTargetId, extra?: unknown) {
    none(this, message, groupId, extra, extra);
  }

  delete_msg(messageId: EventDataTargetId, extra?: unknown) {
    none(this, messageId, extra);
  }

  set_group_name(groupId: EventDataTargetId, groupName: string, extra?: unknown) {
    none(this, groupId, groupName, extra);
  }

  set_group_avatar(groupId: EventDataTargetId, image: string, extra?: unknown) {
    none(this, groupId, image, extra);
  }

  set_group_admin(groupId: EventDataTargetId, userId: EventDataTargetId, enable: boolean, extra?: unknown) {
    none(this, groupId, userId, enable, extra);
  }

  set_group_card(groupId: EventDataTargetId, userId: EventDataTargetId, card: string, extra?: unknown) {
    none(this, groupId, userId, card, extra);
  }

  set_group_ban(groupId: EventDataTargetId, userId?: EventDataTargetId, time?: number, extra?: unknown) {
    none(this, groupId, userId, time, extra);
  }

  send_group_notice(groupId: EventDataTargetId, content: string, image?: string, extra?: unknown) {
    none(this, groupId, content, image, extra);
  }

  set_group_kick(groupId: EventDataTargetId, userId: EventDataTargetId, extra?: unknown) {
    none(this, groupId, userId, extra);
  }

  set_group_leave(groupId: EventDataTargetId, extra?: unknown) {
    none(this, groupId, groupId, extra);
  }
}

export default Api;
