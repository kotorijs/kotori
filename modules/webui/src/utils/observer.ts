export function observer<T extends object>(
  target: T,
  // biome-ignore lint:
  callback: (target: T, prop: keyof T, newValue: any) => void
): T {
  return new Proxy(target, {
    set: (target, prop, newValue, receiver) => {
      const result = Reflect.set(target, prop, newValue, receiver)
      callback(target, prop as keyof T, newValue)
      return result
    }
  })
}

export default observer
