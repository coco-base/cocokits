import { describe, expect, expectTypeOf, it } from 'vitest';
import { hasAccessibleName, hasInteractiveContent } from '../src/index';
import type { QueryableElement } from '../src/index';

describe('public type exports', () => {
  it.each([
    {
      name: 'the parameter of hasAccessibleName is Element',
      check: () => {
        expectTypeOf(hasAccessibleName).parameter(0).toEqualTypeOf<Element>();
        expectTypeOf<HTMLInputElement>().toExtend<Parameters<typeof hasAccessibleName>[0]>();
      },
    },
    {
      name: 'QueryableElement is the parameter of hasInteractiveContent',
      check: () => {
        expectTypeOf(hasInteractiveContent).parameter(0).toEqualTypeOf<QueryableElement>();
        expectTypeOf<Element>().toExtend<QueryableElement>();
      },
    },
  ])('$name', ({ check }) => {
    expect(check).not.toThrow();
  });
});
