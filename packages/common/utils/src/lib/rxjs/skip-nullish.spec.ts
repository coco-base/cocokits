import { of } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { describe, expect, it } from 'vitest';

import { skipNullish } from './skip-nullish';

describe('skipNullish', () => {
  it('should exclude null and undefined values from the result set', (done) => {
    const source$ = of(null, undefined, 0, false, '', 'value', 42, null);
    const expectedOutput = [0, false, '', 'value', 42];

    source$.pipe(skipNullish(), toArray()).subscribe({
      next: (result) => {
        expect(result).toEqual(expectedOutput);
      },
      complete: () => done,
    });
  });

  it('should emit an empty array when the input consists solely of null and undefined values', (done) => {
    const source$ = of(null, undefined, null, undefined);
    const expectedOutput = [] as const;

    source$.pipe(skipNullish(), toArray()).subscribe({
      next: (result) => {
        expect(result).toEqual(expectedOutput);
      },
      complete: () => done,
    });
  });

  it('should emit all non-nullish values unchanged when no null or undefined values are present', (done) => {
    const source$ = of(1, 2, 3);
    const expectedOutput = [1, 2, 3];

    source$.pipe(skipNullish(), toArray()).subscribe({
      next: (result) => {
        expect(result).toEqual(expectedOutput);
      },
      complete: () => done,
    });
  });
});
