import { Elements, string, none } from 'kotori-bot'

export class OnebotElements extends Elements {
  public cq(type: string, data: string) {
    none(this)
    return `[${type},${data}]`
  }

  public at(target: string) {
    return this.cq('at', target)
  }

  public image(url: string) {
    return this.cq('image', url)
  }

  public voice(url: string) {
    return this.cq('record', url)
  }

  public video(url: string) {
    return this.cq('video', url)
  }
}

export default OnebotElements
