import { Elements, string, none } from 'kotori-bot'

export class McElements extends Elements {
  public at(target: string) {
    none(this)
    return `@${String(target).split('@')[1]} `
  }

  public image(url: string) {
    none(this)
    return `[image,${url}]`
  }

  public voice(url: string) {
    none(this)
    return `[voice,${url}]`
  }

  public video(url: string) {
    none(this)
    return `[video,${url}]`
  }

  public face(id: string) {
    none(this)
    return `[face,${id}]`
  }

  public file(data: string) {
    none(data, this)
    return `[file]`
  }
}

export default McElements
