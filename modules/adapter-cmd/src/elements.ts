import { Elements, EventDataTargetId, none } from 'kotori-bot';

export class CmdElements extends Elements {
  at(target: EventDataTargetId) {
    none(this);
    return `@${target} `;
  }

  image(url: string) {
    none(this);
    return `[image,${url}]`;
  }

  voice(url: string) {
    none(this);
    return `[voice,${url}]`;
  }

  video(url: string) {
    none(this);
    return `[video,${url}]`;
  }

  face(id: string) {
    none(this);
    return `[face,${id}]`;
  }

  file(data: string) {
    none(data, this);
    return `[file]`;
  }
}

export default CmdElements;
