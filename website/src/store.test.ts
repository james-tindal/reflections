import { describe, it, expect, vi } from 'vitest'
import { Store, subscribe } from './store'

describe('Store', () => {
  it('returns initial value', () => {
    const store = Store({ count: 0 })
    expect(store.count).toBe(0)
  })

  it('updates value', () => {
    const store = Store({ count: 0 })
    store.count = 5
    expect(store.count).toBe(5)
  })

  it('triggers subscriber on change', () => {
    const store = Store({ count: 0 })
    const fn = vi.fn()
    subscribe(store, 'count', fn)
    store.count = 5
    expect(fn).toHaveBeenCalledExactlyOnceWith(5)
  })

  it('does not trigger subscriber for different key', () => {
    const store = Store({ a: 0, b: 0 })
    const fn = vi.fn()
    subscribe(store, 'a', fn)
    store.b = 5
    expect(fn).not.toHaveBeenCalled()
  })

  it('triggers multiple subscribers for same key', () => {
    const store = Store({ count: 0 })
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    subscribe(store, 'count', fn1)
    subscribe(store, 'count', fn2)
    store.count = 5
    expect(fn1).toHaveBeenCalledExactlyOnceWith(5)
    expect(fn2).toHaveBeenCalledExactlyOnceWith(5)
  })

  it('returns unsubscribe function', () => {
    const store = Store({ count: 0 })
    const fn = vi.fn()
    const unsub = subscribe(store, 'count', fn)
    unsub()
    store.count = 5
    expect(fn).not.toHaveBeenCalled()
  })

  it('unsubscribe only affects one subscription', () => {
    const store = Store({ count: 0 })
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    subscribe(store, 'count', fn1)
    const unsub2 = subscribe(store, 'count', fn2)
    unsub2()
    store.count = 5
    expect(fn1).toHaveBeenCalledExactlyOnceWith(5)
    expect(fn2).not.toHaveBeenCalled()
  })
})
