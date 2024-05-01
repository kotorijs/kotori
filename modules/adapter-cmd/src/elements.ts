import { Elements, EventDataTargetId, none } from 'kotori-bot';

export class CmdElements extends Elements {
  public at(target: EventDataTargetId) {
    none(this);
    return `@${target} `;
  }

  public image(url: string) {
    none(this);
    return `[image,${url}]`;
  }

  public voice(url: string) {
    none(this);
    return `[voice,${url}]`;
  }

  public video(url: string) {
    none(this);
    return `[video,${url}]`;
  }

  public face(id: string) {
    none(this);
    return `[face,${id}]`;
  }

  public file(data: string) {
    none(data, this);
    return `[file]`;
  }
}

export default CmdElements;
