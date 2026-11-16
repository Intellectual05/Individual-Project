// Node 25 exposes a no-op `localStorage` stub that shadows jsdom's
// implementation. Install a working in-memory storage for the test suite.
function createStorage(): Storage {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, String(value)),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: createStorage(),
  configurable: true,
  writable: true,
})
