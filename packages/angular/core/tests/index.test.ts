import { describe, expect, it } from 'vitest';
import * as entry from '../src/index';

describe('@cocokits/angular-core', () => {
  it('loads its root entry', () => {
    expect(entry).toBeDefined();
  });
});
