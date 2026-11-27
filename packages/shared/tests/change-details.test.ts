import { describe, expectTypeOf, it } from 'vitest';
import type { ChangeDetails, ValueChangeDetails } from '../src/index';

describe('change details types', () => {
  it('ChangeDetails carries a closed reason and the event or null', () => {
    expectTypeOf<ChangeDetails<'user' | 'form-reset'>>().toEqualTypeOf<{
      readonly reason: 'user' | 'form-reset';
      readonly event: Event | null;
    }>();
  });

  it('ValueChangeDetails adds the value', () => {
    expectTypeOf<ValueChangeDetails<string, 'user'>>().toExtend<ChangeDetails<'user'>>();
    expectTypeOf<ValueChangeDetails<string, 'user'>['value']>().toEqualTypeOf<string>();
  });

  it('rejects a reason outside the union', () => {
    // @ts-expect-error 'api' is not a reason of this union
    const details: ChangeDetails<'user'> = { reason: 'api', event: null };
    expectTypeOf(details).toBeObject();
  });
});
