const subscribers = Symbol('subscribers')

export function Store<T extends Record<string, unknown>>(target: T): T {
  const subs = new Map<string, Set<(value: unknown) => void>>()

  const handler: ProxyHandler<T> = {
    get(_, key) {
      return target[key as keyof T]
    },
    set(_, key, value) {
      target[key as keyof T] = value
      const keySubs = subs.get(key as string)
      if (keySubs) {
        keySubs.forEach(fn => fn(value))
      }
      return true
    }
  }

  const proxy = new Proxy(target, handler)
  ;(proxy as any)[subscribers] = subs
  return proxy
}

export function subscribe<T, K extends keyof T>(
  store: T,
  key: K,
  callback: (value: T[K]) => void
): () => void {
  const subs = (store as any)[subscribers] as Map<string, Set<(value: unknown) => void>> | undefined
  
  if (!subs) return () => {}

  const keyStr = key as string
  if (!subs.has(keyStr))
    subs.set(keyStr, new Set())
  
  subs.get(keyStr)!.add(callback as (value: unknown) => void)
  
  return () => {
    subs.get(keyStr)?.delete(callback as (value: unknown) => void)
  }
}
