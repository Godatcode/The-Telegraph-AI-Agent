import { describe, it, expect } from 'vitest';

describe('Server Setup', () => {
  it('should have express configured', async () => {
    const express = await import('express');
    expect(express.default).toBeDefined();
  });

  it('should have cors configured', async () => {
    const cors = await import('cors');
    expect(cors.default).toBeDefined();
  });
});
