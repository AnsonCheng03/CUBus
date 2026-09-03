import { randomBytes } from 'node:crypto';

export interface RequestTokenStore {
  issue(): string;
  has(token: string): boolean;
}

export class InMemoryRequestTokenStore implements RequestTokenStore {
  private readonly tokens = new Map<string, number>();

  constructor(private readonly ttlMs = 7 * 24 * 60 * 60 * 1_000) {}

  issue() {
    this.removeExpired();
    const token = randomBytes(32).toString('hex');
    this.tokens.set(token, Date.now() + this.ttlMs);
    return token;
  }

  has(token: string) {
    this.removeExpired();
    const expiresAt = this.tokens.get(token);
    if (expiresAt === undefined) return false;
    if (expiresAt <= Date.now()) {
      this.tokens.delete(token);
      return false;
    }
    return true;
  }

  private removeExpired() {
    const now = Date.now();
    for (const [token, expiresAt] of this.tokens) {
      if (expiresAt <= now) this.tokens.delete(token);
    }
  }
}
