import { describe, expect, it } from 'vitest';
import pkg from '../package.json' with { type: 'json' };

describe('@cocokits/cdk', () => {
  it('has no root entry (one subpath per entry point, D-019)', () => {
    expect(Object.keys(pkg.exports)).not.toContain('.');
  });
});
