import { Elements, EventDataTargetId, none } from 'kotori-bot';
import QQAdapter from '.';

export class QQElements extends Elements<QQAdapter> {

  public image(url: string) {
    const seq = this.adapter.msg_seq;
    this.adapter.imageStack[seq] = true;;
    this.adapter.send
      ('send_group_msg_media', { url })?.then(res => {
        if (!res || typeof res !== 'object' || !('file_info' in res)) {
          delete this.adapter.imageStack[seq]
          return;
        };
        this.adapter.imageStack[this.adapter.msg_seq] = res.file_info as string;
      })
    return '';
  }
}

export default QQElements;
