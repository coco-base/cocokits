import { describe, expect, it } from 'vitest';
import { toIdSegment } from '../src/index';

describe('toIdSegment', () => {
  it('keeps letters, digits and dashes', () => {
    expect(toIdSegment('account-2')).toBe('account-2');
  });

  it('encodes whitespace and punctuation so no segment contains them', () => {
    expect(toIdSegment('a b')).not.toMatch(/\s/);
    expect(toIdSegment('a.b#c')).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('is injective: values that differ only in punctuation or whitespace never collide', () => {
    const values = ['a b', 'a_b', 'a-b', 'a.b', 'a  b', 'a_20b', 'a b ', '', '_', '__', 'é', 'e'];
    const encoded = values.map(toIdSegment);
    expect(new Set(encoded).size).toBe(values.length);
  });

  it('encodes non-ASCII characters', () => {
    expect(toIdSegment('é')).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(toIdSegment('😀')).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('keeps numbers and their text apart, and numbers apart from each other', () => {
    const values: (string | number)[] = [1, '1', 1.5, '1.5', -1, '-1', '_n_1', '_n_', 0, '0', 10, '1e1'];
    const encoded = values.map(toIdSegment);
    expect(new Set(encoded).size).toBe(values.length);
    for (const segment of encoded) expect(segment).toMatch(/^[A-Za-z0-9_-]*$/);
  });
});
