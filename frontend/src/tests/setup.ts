type StorageValue = string

function createMemoryStorage() {
  const store = new Map<string, StorageValue>()

  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, String(value))
    },
  } as Storage
}

const localStorageShim = createMemoryStorage()
const sessionStorageShim = createMemoryStorage()

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: localStorageShim,
  writable: true,
})

Object.defineProperty(globalThis, 'sessionStorage', {
  configurable: true,
  value: sessionStorageShim,
  writable: true,
})

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: localStorageShim,
    writable: true,
  })

  Object.defineProperty(window, 'sessionStorage', {
    configurable: true,
    value: sessionStorageShim,
    writable: true,
  })
}
