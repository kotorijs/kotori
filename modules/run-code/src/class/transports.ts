import { LoggerData, Transport } from 'kotori-bot';

export class BoxTransport extends Transport {
  public result = '';

  public handle(data: LoggerData) {
    this.result += data.msg;
  }
}

export default BoxTransport;
