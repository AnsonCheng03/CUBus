import { describe, expect, it } from 'vitest';
import { prismaDateTimeFromHongKong } from '../src/prisma-date.js';

describe('prismaDateTimeFromHongKong', () => {
  it('preserves legacy Hong Kong DATETIME wall-clock components', () => {
    expect(prismaDateTimeFromHongKong('2026-09-02 14:46:17').toISOString())
      .toBe('2026-09-02T14:46:17.000Z');
  });
});
