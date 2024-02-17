import { Elements, EventDataTargetId, none } from 'kotori-bot';

export class OnebotElements extends Elements {
  cq(type: string, data: EventDataTargetId) {
    none(this);
    return `[${type},${data}]`;
  }

  at(target: EventDataTargetId) {
    return this.cq('at', target);
  }

  image(url: string) {
    return this.cq('image', url);
  }

  voice(url: string) {
    return this.cq('record', url);
  }

  video(url: string) {
    return this.cq('video', url);
  }
}

export default OnebotElements;
