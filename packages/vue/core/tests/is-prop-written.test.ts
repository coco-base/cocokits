// @vitest-environment jsdom
import { render } from '@testing-library/vue';
import { defineComponent, getCurrentInstance, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { isPropWritten } from '../src/is-prop-written';

/** Renders a component that records which of `names` the parent wrote on it. */
function written(parentProps: Record<string, unknown>, names: string[]): boolean[] {
  let result: boolean[] = [];
  const Child = defineComponent({
    props: { open: Boolean, modelValue: { type: String, default: undefined } },
    setup() {
      const instance = getCurrentInstance();
      result = names.map((name) => isPropWritten(instance, name));
      return () => null;
    },
  });
  render(() => h(Child, parentProps));
  return result;
}

describe('isPropWritten', () => {
  it('is true for a prop the parent wrote, in camel or kebab case, whatever its value', () => {
    expect(written({ open: false }, ['open'])).toEqual([true]);
    expect(written({ 'model-value': undefined }, ['modelValue'])).toEqual([true]);
    expect(written({ modelValue: 'a' }, ['modelValue'])).toEqual([true]);
  });

  it('is false for a prop the parent did not write, and without an instance', () => {
    expect(written({ modelValue: 'a' }, ['open'])).toEqual([false]);
    expect(isPropWritten(null, 'open')).toBe(false);
  });
});
