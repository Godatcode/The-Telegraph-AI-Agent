import { describe, it, expect } from 'vitest';

describe('Project Setup', () => {
  it('should have vitest configured correctly', () => {
    expect(true).toBe(true);
  });

  it('should be able to import fast-check', async () => {
    const fc = await import('fast-check');
    expect(fc).toBeDefined();
    expect(fc.default).toBeDefined();
  });
});
