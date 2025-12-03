import { Storage } from "@ionic/storage";

class KVStore {
  private store = new Storage();
  private ready = false;

  async ensure() {
    if (!this.ready) {
      await this.store.create();
      this.ready = true;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    await this.ensure();
    const raw = await this.store.get(key);
    return raw == null ? null : JSON.parse(raw);
  }

  async set(key: string, value: any) {
    await this.ensure();
    await this.store.set(key, JSON.stringify(value));
  }

  async clearAll() {
    await this.ensure();
    await this.store.clear();
  }
}

export const kv = new KVStore();
