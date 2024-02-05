import { none } from '@kotori-bot/tools';
import type Adapter from './adapter';
import type { EventDataTargetId, MessageRaw } from '../types';

interface ApiImpl {
  readonly adapter: Adapter<this>;

  sendPrivateMsg(message: MessageRaw, userId: EventDataTargetId): /* Promise<unknown> | */ void;

  sendGroupMsg(message: MessageRaw, groupId: EventDataTargetId): /* Promise<unknown> | */ void;

  deleteMsg(messageId: EventDataTargetId): void;

  setGroupName(groupId: EventDataTargetId, groupName: string): void;

  setGroupAvatar(groupId: EventDataTargetId, image: string): void;

  setGroupAdmin(groupId: EventDataTargetId, userId: EventDataTargetId, enable: boolean): void;

  setGroupCard(groupId: EventDataTargetId, userId: EventDataTargetId, card: string): void;

  setGroupBan(groupId: EventDataTargetId, userId?: EventDataTargetId, time?: number): void;

  sendGroupNotice(groupId: EventDataTargetId, content: string, image?: string): void;

  setGroupKick(groupId: EventDataTargetId, userId: EventDataTargetId): void;

  setGroupLeave(groupId: EventDataTargetId): void;
}

export abstract class Api implements ApiImpl {
  readonly adapter: Adapter<this>;

  constructor(adapter: Adapter) {
    this.adapter = adapter as Adapter<this>;
  }

  sendPrivateMsg(message: MessageRaw, userId: EventDataTargetId, ...extra: unknown[]) {
    none(this, message, userId, extra);
  }

  sendGroupMsg(message: MessageRaw, groupId: EventDataTargetId, ...extra: unknown[]) {
    none(this, message, groupId, extra, extra);
  }

  deleteMsg(messageId: EventDataTargetId, ...extra: unknown[]) {
    none(this, messageId, extra);
  }

  setGroupName(groupId: EventDataTargetId, groupName: string, ...extra: unknown[]) {
    none(this, groupId, groupName, extra);
  }

  setGroupAvatar(groupId: EventDataTargetId, image: string, ...extra: unknown[]) {
    none(this, groupId, image, extra);
  }

  setGroupAdmin(groupId: EventDataTargetId, userId: EventDataTargetId, enable: boolean, ...extra: unknown[]) {
    none(this, groupId, userId, enable, extra);
  }

  setGroupCard(groupId: EventDataTargetId, userId: EventDataTargetId, card: string, ...extra: unknown[]) {
    none(this, groupId, userId, card, extra);
  }

  setGroupBan(groupId: EventDataTargetId, userId?: EventDataTargetId, time?: number, ...extra: unknown[]) {
    none(this, groupId, userId, time, extra);
  }

  sendGroupNotice(groupId: EventDataTargetId, content: string, image?: string, ...extra: unknown[]) {
    none(this, groupId, content, image, extra);
  }

  setGroupKick(groupId: EventDataTargetId, userId: EventDataTargetId, ...extra: unknown[]) {
    none(this, groupId, userId, extra);
  }

  setGroupLeave(groupId: EventDataTargetId, ...extra: unknown[]) {
    none(this, groupId, groupId, extra);
  }
}

export default Api;
