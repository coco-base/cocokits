import { describe, expect, it } from 'vitest';
import * as entry from '../index';

describe('@cocokits/cdk/focus', () => {
  it('loads its entry point', () => {
    expect(entry).toBeDefined();
  });
});
