import '../types';
import Kotori, { LoggerData, Transport, none } from 'kotori-bot';

export default class WebuiTransport extends Transport {
  public handle(data: LoggerData) {
    none(this);
    Kotori.emit('console_output', data);
  }
}
