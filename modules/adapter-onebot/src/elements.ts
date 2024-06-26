import { Elements, EventDataTargetId, none } from 'kotori-bot';
import { MessageCqType } from './types';

export class OnebotElements extends Elements {
  public cq(type: MessageCqType, data: string) {
    none(this);
    return `[CQ:${type},${data}]`;
  }

  public at(target: EventDataTargetId) {
    return this.cq('at', `qq=${target}`);
  }

  public image(url: string) {
    return this.cq('image', `file=${url},cache=0`);
  }

  public voice(url: string) {
    return this.cq('record', `file=${url}`);
  }

  public video(url: string) {
    return this.cq('video', `file=${url}`);
  }

  public face(id: number) {
    return this.cq('face', `id=${id}`);
  }
}

export default OnebotElements;
