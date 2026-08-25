import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const defaults: Record<string, unknown> = {
  'Status.json': {},
  'Alert.json': [],
  'timetable.json': {},
};

export class JsonFileStore {
  constructor(private readonly rootDirectory: string) {}

  path(name: string): string {
    return join(this.rootDirectory, name);
  }

  async read<T>(name: string): Promise<T> {
    try {
      return JSON.parse(await readFile(this.path(name), 'utf8')) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      return structuredClone((defaults[name] ?? {}) as T);
    }
  }

  async modifiedAt(name: string): Promise<string> {
    try {
      const details = await stat(this.path(name));
      return toSqlDate(details.mtime);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      return '1970-01-01 00:00:00';
    }
  }

  async writeAtomic(name: string, value: unknown): Promise<void> {
    const target = this.path(name);
    const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
    await mkdir(dirname(target), { recursive: true });
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    await rename(temporary, target);
  }
}

export function toSqlDate(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}
