import { Elements, EventDataTargetId, none } from 'kotori-bot';
import { MessageCqType } from './types';

export class OnebotElements extends Elements {
  cq(type: MessageCqType, data: string) {
    none(this);
    return `[CQ:${type},${data}]`;
  }

  at(target: EventDataTargetId) {
    return this.cq('at', `qq=${target}`);
  }

  image(url: string) {
    return this.cq('image', `file=${url},cache=0`);
  }

  voice(url: string) {
    return this.cq('record', `file=${url}`);
  }

  video(url: string) {
    return this.cq('video', `file=${url}`);
  }

  face(id: number) {
    return this.cq('face', `id=${id}`);
  }
}

export default OnebotElements;
