import { describe, expect, it } from 'vitest';

import { fuzzysearch } from './fuzzysearch';

describe('fuzzysearch', () => {
  it('should return true when the needle is contained non-sequentially in the haystack', () => {
    expect(fuzzysearch('cde', 'abcdef')).toBeTruthy();
  });

  it('should return false when the needle is not contained in the haystack', () => {
    expect(fuzzysearch('xyz', 'abcdef')).toBeFalsy();
  });

  it('should return true when the needle matches the haystack exactly', () => {
    expect(fuzzysearch('abcdef', 'abcdef')).toBeTruthy();
  });

  it('should return false when the needle is longer than the haystack', () => {
    expect(fuzzysearch('abcdefg', 'abcdef')).toBeFalsy();
  });

  it('should return true when the needle is an empty string', () => {
    expect(fuzzysearch('', 'abcdef')).toBeTruthy();
  });

  it('should return false when the haystack is empty and the needle is not', () => {
    expect(fuzzysearch('abc', '')).toBeFalsy();
  });

  it('should return true when both the needle and the haystack are empty', () => {
    expect(fuzzysearch('', '')).toBeTruthy();
  });
});
