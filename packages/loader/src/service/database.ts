import type { Service } from '@kotori-bot/core'
// import type knex from 'knex'

export interface Database extends Service {
  // internal: ReturnType<typeof knex>
  // select: ReturnType<typeof knex>['select']
  // delete: ReturnType<typeof knex>['delete']
  // update: ReturnType<typeof knex>['update']
  // insert: ReturnType<typeof knex>['insert']
  // schema: ReturnType<typeof knex>['schema']
}

export default Database
