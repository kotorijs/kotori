import Service from './service';

export abstract class Database extends Service {
  constructor() {
    super('database', '');
  }
}

export default Database;
