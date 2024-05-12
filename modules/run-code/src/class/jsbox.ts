import vm from 'node:vm';
import { Logger } from 'kotori-bot';
import BoxTransport from './transports';

class JsBox {
  protected box: BoxTransport;

  protected code: string;

  protected method;

  public constructor(code: string) {
    this.code = code;
    this.box = new BoxTransport({});
    const logger = new Logger({
      transports: this.box
    });
    this.method = {
      console: {
        log: logger.info.bind(logger),
        dir: logger.info.bind(logger),
        info: logger.info.bind(logger),
        error: logger.error.bind(logger),
        warn: logger.warn.bind(logger)
      }
    };
  }

  public async run() {
    return new Promise<string>((resolve) => {
      const timer = setTimeout(() => {
        throw new Error('run timeout');
      }, 1000 * 5);
      try {
        vm.runInNewContext(this.code, this.method);
        clearTimeout(timer);
      } catch (error) {
        this.method.console.error(String(error));
      }
      resolve(this.box.result);
    });
  }
}

export default JsBox;
