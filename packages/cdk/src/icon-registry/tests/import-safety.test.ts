import { describe, expect, it } from 'vitest';

describe('@cocokits/cdk/icon-registry import safety', () => {
  it('imports in node without window or document', async () => {
    expect(typeof document).toBe('undefined');
    const entry = await import('../index');
    expect(Object.keys(entry).sort()).toEqual(['createIconRegistry', 'parseSvg']);
    expect(entry.createIconRegistry().has('check')).toBe(true);
    expect(entry.parseSvg('<svg viewBox="0 0 1 1"></svg>')).toBeUndefined();
  });
});
