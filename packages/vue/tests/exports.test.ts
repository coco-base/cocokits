import { describe, expect, it } from 'vitest';
import pkg from '../package.json' with { type: 'json' };

describe('@cocokits/vue', () => {
  it('has no root entry (one subpath per entry point)', () => {
    expect(Object.keys(pkg.exports)).not.toContain('.');
  });
});
