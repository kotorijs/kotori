class Random {
  private seed: () => number

  public constructor(seed = Math.random) {
    this.seed = seed
  }

  public int(min = 0, max = 100) {
    const minHandle = Math.ceil(min)
    const maxHandle = Math.floor(max)
    return Math.floor(this.seed() * (maxHandle - minHandle)) + minHandle
  }

  public float(min = 0, max = 1) {
    return this.seed() * (max - min) + min
  }

  public bool(offset = 0.5): boolean {
    return this.seed() < offset
  }

  public choice<T>(list: Array<T>): T {
    if (list.length === 0) {
      throw new Error('Cannot choose from an empty list')
    }
    const index = this.int(0, list.length)
    return list[index]
  }

  public shuffle<T>(list: Array<T>): Array<T> {
    const shuffled = [...list]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.int(0, i + 1)
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  public uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (this.seed() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
}

export namespace random {
  const random = new Random()

  export const int = random.int.bind(random)

  export const float = random.float.bind(random)

  export const bool = random.bool.bind(random)

  export const choice = random.choice.bind(random)

  export const shuffle = random.shuffle.bind(random)

  export const uuid = random.uuid.bind(random)

  export const clone = (seed = Math.random) => new Random(seed)
}
