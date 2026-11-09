import { describe, expect, expectTypeOf, it } from 'vitest';
import { hasAccessibleName, hasChoiceControlName, hasInteractiveContent } from '../src/index';
import type { ChoiceLabelPart, NameableElement, QueryableElement } from '../src/index';

describe('public type exports', () => {
  it.each([
    {
      name: 'NameableElement is the parameter of hasAccessibleName',
      check: () => {
        expectTypeOf(hasAccessibleName).parameter(0).toEqualTypeOf<NameableElement>();
        expectTypeOf<HTMLInputElement>().toExtend<NameableElement>();
      },
    },
    {
      name: 'ChoiceLabelPart is the second parameter of hasChoiceControlName',
      check: () => {
        expectTypeOf(hasChoiceControlName).parameter(1).toEqualTypeOf<ChoiceLabelPart>();
        expectTypeOf<HTMLLabelElement>().toExtend<ChoiceLabelPart>();
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
