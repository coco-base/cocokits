import { describe, expect, expectTypeOf, it } from 'vitest';
import { defineAnatomy } from '../src/index';

const part = (name: string) => ({ name, description: `${name}.` });

describe('defineAnatomy', () => {
  const anatomy = defineAnatomy({
    block: 'button',
    parts: { root: part('Root'), leadingIcon: part('Leading icon') },
  });

  it.each([
    { key: 'root', expected: 'cck-button' },
    { key: 'leadingIcon', expected: 'cck-button__leading-icon' },
  ] as const)('maps $key to $expected', ({ key, expected }) => {
    expect(anatomy.classes[key]).toBe(expected);
  });

  it('keeps literal types without as const at the call site', () => {
    expectTypeOf(anatomy.classes.root).toEqualTypeOf<'cck-button'>();
    expectTypeOf(anatomy.classes.leadingIcon).toEqualTypeOf<'cck-button__leading-icon'>();
    expectTypeOf(anatomy.block).toEqualTypeOf<'button'>();
  });

  it('returns the declared parts', () => {
    expect(anatomy.parts.root.name).toBe('Root');
  });

  it('requires a root part', () => {
    // @ts-expect-error root is missing
    defineAnatomy({ block: 'x', parts: { trigger: part('Trigger') } });
  });
});
