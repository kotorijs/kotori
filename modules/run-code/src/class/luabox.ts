/* eslint no-console: 0 */
import { createEnv } from 'lua-in-js';
import JsBox from './jsbox';

class LuaBox extends JsBox {
  async run() {
    const backupLog = console.log;
    try {
      const timer = setTimeout(() => {
        throw new Error('run timeout');
      }, 1000 * 5);
      console.log = (...args: unknown[]) => this.method.console.log(...args);
      createEnv().parse(this.code).exec();
      clearTimeout(timer);
    } catch (error) {
      this.method.console.error(String(error));
    } finally {
      console.log = backupLog;
    }
    return this.box.result;
  }
}

export default LuaBox;
