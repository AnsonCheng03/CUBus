import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { JsonFileStore } from '../src/data/file-store.js';

describe('JsonFileStore', () => {
  it('supplies safe defaults and atomically replaces JSON', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'cu-bus-store-'));
    const store = new JsonFileStore(directory);
    expect(await store.read('Status.json')).toEqual({});

    await store.writeAtomic('Status.json', { one: 'normal' });
    expect(await store.read('Status.json')).toEqual({ one: 'normal' });
    expect(JSON.parse(await readFile(join(directory, 'Status.json'), 'utf8'))).toEqual({ one: 'normal' });
  });
});
