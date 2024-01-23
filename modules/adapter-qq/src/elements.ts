import { Elements, EventDataTargetId, none } from 'kotori-bot';
import QQAdapter from './adapter';

export class QQElements extends Elements /* <QQAdapter>*/ {

  public image(url: string) {
    const seq = (this.adapter as QQAdapter).msg_seq;
    (this.adapter as  QQAdapter).imageStack[seq] = true;;
    (this.adapter as QQAdapter).send
      ('send_group_msg_media', { url })?.then(res => {
        if (!res || typeof res !== 'object' || !('file_info' in res)) {
          delete (this.adapter as  QQAdapter).imageStack[seq]
          return;
        };
        (this.adapter as  QQAdapter).imageStack[(this.adapter as  QQAdapter).msg_seq] = res.file_info as string;
      })
    return '';
  }
}

export default QQElements;
