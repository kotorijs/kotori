import { CommandError, Context, EventDataApiBase, MessageQuickReal, MessageScope, Tsu } from 'kotori-bot';

export const lang = [__dirname, '../locales'];

export const config = Tsu.Object({
  onBotGroupIncrease: Tsu.Boolean().default(true),
  onBotGroupDecrease: Tsu.Boolean().default(true),
  onBotGroupAdmin: Tsu.Boolean().default(true),
  onBotGroupBan: Tsu.Boolean().default(true),
  onGroupRecall: Tsu.Boolean().default(true),
  onPirvateRecall: Tsu.Boolean().default(true),
  onGroupRequest: Tsu.Boolean().default(true),
  onPrivateRequest: Tsu.Boolean().default(true),
  onGroupMsg: Tsu.Boolean().default(true),
  onPrivateMsg: Tsu.Boolean().default(true)
});

export const inject = ['cache'];

export function main(ctx: Context, con: Tsu.infer<typeof config>) {
  const send = (session: EventDataApiBase) => (msg: Exclude<MessageQuickReal, void | CommandError>) => {
    let handle = msg;
    if (typeof handle !== 'string') handle = session.format(...handle);
    else handle = session.i18n.locale(handle);
    session.api.sendPrivateMsg(handle, session.api.adapter.config.master);
  };

  if (con.onBotGroupIncrease) {
    ctx.on('on_group_increase', (session) => {
      if (session.userId !== session.api.adapter.selfId) return;
      send(session)([`requester.msg.increase`, { operator: session.operatorId, group: session.groupId }]);
    });
  }

  if (con.onBotGroupDecrease) {
    ctx.on('on_group_decrease', (session) => {
      if (session.userId !== session.api.adapter.selfId) return;
      send(session)([
        `requester.msg.decrease.${session.operatorId === session.userId ? 'leave' : 'kick'}`,
        { operator: session.operatorId, group: session.groupId }
      ]);
    });
  }

  if (con.onBotGroupAdmin) {
    ctx.on('on_group_admin', (session) => {
      if (session.userId !== session.api.adapter.selfId) return;
      send(session)([`requester.msg.admin.${session.userId ? 'set' : 'unset'}`, { group: session.groupId }]);
    });
  }

  if (con.onBotGroupBan) {
    ctx.on('on_group_ban', (session) => {
      if (session.userId !== session.api.adapter.selfId) return;
      send(session)([
        `requester.msg.ban.${session.time > 0 ? 'ban' : 'lift_ban'}`,
        {
          operator: session.operatorId,
          group: session.groupId,
          time: session.time ? session.time / 60 : 0
        }
      ]);
    });
  }

  if (con.onPirvateRecall || con.onGroupRecall) {
    ctx.on('on_recall', (session) => {
      if (session.userId === session.api.adapter.selfId || session.operatorId === session.api.adapter.selfId) return;
      if (con.onPirvateRecall && session.type === MessageScope.PRIVATE) {
        const message = ctx.cache.get<string>(`${session.api.adapter.platform}${session.messageId}`);
        if (!message) return;
        send(session)([`requester.msg.recall.private`, { user: session.userId, message }]);
      } else if (con.onGroupRecall && session.type === MessageScope.GROUP) {
        const message = ctx.cache.get<string>(`${session.api.adapter.platform}${session.messageId}`);
        if (!message) return;
        send(session)([
          `requester.msg.recall.group.${session.operatorId === session.userId ? 'self' : 'other'}`,
          { user: session.userId, operator: session.operatorId, message, group: session.groupId }
        ]);
      }
    });
  }

  if (con.onPrivateRequest || con.onGroupRequest) {
    ctx.on('on_request', (session) => {
      if (con.onPrivateRequest && session.type === MessageScope.PRIVATE) {
        send(session)([`requester.msg.request.private`, { user: session.userId }]);
      } else if (con.onGroupMsg && session.type === MessageScope.GROUP) {
        send(session)([`requester.msg.request.group`, { user: session.userId, group: session.groupId }]);
      }
    });
  }

  if (con.onGroupMsg || con.onPrivateMsg) {
    ctx.on('on_message', (session) => {
      if (session.userId === session.api.adapter.selfId) return;
      if (session.type === MessageScope.GROUP) {
        if (con.onGroupRecall) {
          ctx.cache.set(`${session.api.adapter.platform}${session.messageId}`, session.message);
        }
        /*         if (con.onGroupMsg && session.message.includes(String(session.api.adapter.selfId))) {
          send(session)([
            `requester.msg.msg.group`,
            { user: session.userId, group: session.groupId, message: session.message }
          ]);
        }
        return; */
      }
      if (con.onPirvateRecall) {
        ctx.cache.set(`${session.api.adapter.platform}${session.messageId}`, session.message);
      }
      if (con.onPrivateMsg && String(session.userId) !== String(session.api.adapter.config.master)) {
        send(session)([`requester.msg.msg.private`, { user: session.userId, message: session.message }]);
      }
    });
  }
}
