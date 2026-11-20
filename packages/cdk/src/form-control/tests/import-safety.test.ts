import { describe, expect, it } from 'vitest';

describe('@cocokits/cdk/form-control import safety', () => {
  it('imports in node without window or document and has no side effects', async () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    const entry = await import('../index');
    expect(Object.keys(entry)).toEqual(['createFormParticipation', 'trackLabelActivation']);
  });
});
