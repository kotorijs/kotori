import path from 'path';
import { Context } from 'kotori-bot';

export const lang = [__dirname, '../locales'];

export const inject = ['database'];

export function main(ctx: Context) {
  ctx.on('ready', async () => {
    await ctx.db
      .createTable('access', (table) => {
        table.increments();
        table.string('platform');
        table.string('groupId');
        table.string('userId');
      })
      .catch(() => {});
  });

  ctx.on('parse', (data) => {});
}

// const message = controlParams(`${data.group_id}\\accessList.json`
