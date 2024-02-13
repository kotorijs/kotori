import { LoggerData, Transport } from 'kotori-bot';

export class BoxTransport extends Transport {
  result = '';

  handle(data: LoggerData) {
    this.result += data.msg;
  }
}

export default BoxTransport;
