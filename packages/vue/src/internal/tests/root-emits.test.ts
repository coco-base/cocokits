import { describe, expect, it } from 'vitest';
import { SelectRoot } from '../../select';
import { TabsRoot } from '../../tabs';

/** R-VUE-1: a Root reports a change through `update:*` only, as Reka UI does. */
describe('Root emits', () => {
  it('SelectRoot emits update:modelValue and update:open only', () => {
    expect((SelectRoot as { emits?: readonly string[] }).emits).toEqual(['update:modelValue', 'update:open']);
  });

  it('TabsRoot emits update:modelValue only', () => {
    expect((TabsRoot as { emits?: readonly string[] }).emits).toEqual(['update:modelValue']);
  });
});
