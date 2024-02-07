import { Context, Service } from '@kotori-bot/core';
import knex from 'knex';
import { resolve } from 'path';

export class Database extends Service {
  private db?: ReturnType<typeof knex>;

  constructor(ctx: Context) {
    super(ctx, {}, 'database');
  }

  start() {
    if (this.db) return;
    this.db = knex({
      client: 'sqlite',
      connection: {
        filename: resolve(this.ctx.baseDir.root, 'kotori.db')
      },
      useNullAsDefault: true
    });
  }

  stop() {
    if (!this.db) return;
    delete this.db;
  }

  createTable(name: string, callback: Parameters<ReturnType<typeof knex>['schema']['createTable']>[1]) {
    return this.db!.schema.createTable(name, callback);
  }

  select(...args: Parameters<ReturnType<typeof knex>['select']>) {
    return this.db!.select(args);
  }

  insert(...args: Parameters<ReturnType<typeof knex>['insert']>) {
    return this.db!.insert(...args);
  }

  update(...args: Parameters<ReturnType<typeof knex>['update']>) {
    return this.db!.update(...args);
  }

  delete(...args: Parameters<ReturnType<typeof knex>['delete']>) {
    return this.db!.delete(...args);
  }
}

export default Database;
