import { Storage } from '@ionic/storage';

let _store: Storage | null = null;

export async function getStore() {
  if (_store) return _store;
  _store = new Storage();
  await _store.create();
  return _store;
}

export async function setItem<T>(key: string, value: T) {
  const store = await getStore();
  await store.set(key, typeof value === 'string' ? value : JSON.stringify(value));
}

export async function getItem<T>(key: string): Promise<T | null> {
  const store = await getStore();
  const raw = await store.get(key);
  try {
    return typeof raw === 'string' ? (JSON.parse(raw) as T) : (raw as T);
  } catch {
    return (raw as T) ?? null;
  }
}

export async function removeItem(key: string) {
  const store = await getStore();
  await store.remove(key);
}

export async function clearAll() {
  const store = await getStore();
  await store.clear();
}
