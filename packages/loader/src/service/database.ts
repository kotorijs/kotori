import { Context, Service } from '@kotori-bot/core';
import knex from 'knex';
import { resolve } from 'path';

export class Database extends Service {
  internal: ReturnType<typeof knex>;

  select: ReturnType<typeof knex>['select'];

  delete: ReturnType<typeof knex>['delete'];

  update: ReturnType<typeof knex>['update'];

  insert: ReturnType<typeof knex>['insert'];

  schema: ReturnType<typeof knex>['schema'];

  constructor(ctx: Context) {
    super(ctx, {}, 'database');
    this.internal = knex(
      {
        client: 'sqlite',
        connection: {
          filename: resolve(this.ctx.baseDir.root, 'kotori.db')
        },
        useNullAsDefault: true
      } /*  {
        client: 'mysql',
        connection: {
          host: '127.0.0.1',
          port: 3306,
          user: 'kotori',
          password: 'kotori',
          database: 'kotori'
        }
      } */
    );
    this.select = this.internal.select.bind(this.internal);
    this.delete = this.internal.delete.bind(this.internal);
    this.update = this.internal.update.bind(this.internal);
    this.insert = this.internal.insert.bind(this.internal);
    this.schema = this.internal.schema;
  }
}

export default Database;
