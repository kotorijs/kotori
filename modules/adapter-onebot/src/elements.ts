import { Elements, type string, none } from 'kotori-bot'
import type { MessageCqType } from './types'

export class OnebotElements extends Elements {
  public cq(type: MessageCqType, data: string) {
    none(this)
    return `[CQ:${type},${data}]`
  }

  public at(target: string) {
    return this.cq('at', `qq=${target}`)
  }

  public image(url: string) {
    return this.cq('image', `file=${url},cache=0`)
  }

  public voice(url: string) {
    return this.cq('record', `file=${url}`)
  }

  public video(url: string) {
    return this.cq('video', `file=${url}`)
  }

  public face(id: number) {
    return this.cq('face', `id=${id}`)
  }
}

export default OnebotElements
