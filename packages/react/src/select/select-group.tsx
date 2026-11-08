'use client';

import { useId, useMemo, type ReactElement } from 'react';
import { toReactProps } from '@cocokits/react-core';
import { renderElement } from '../internal/render-element';
import { SelectGroupContext, useSelectContext } from './select-context';
import type { SelectPart, SelectRenderProps } from './select.types';
import type { SelectGroupProps } from './select-parts.types';
import { useSelectPartProps } from './use-select-part';

/** The attributes the machine owns; a consumer value can never replace them. */
const RESERVED = ['role', 'aria-labelledby', 'aria-disabled', 'data-disabled'];

function SelectGroupImpl({ disabled = false, render, ref, ...rest }: SelectGroupProps): ReactElement {
  const context = useSelectContext<unknown>('Select.Group');
  const key = useId();
  const group = useMemo(() => ({ key, disabled }), [key, disabled]);
  const props = useSelectPartProps({
    ours: { ...context.theme.optionGroup, ...toReactProps(context.parts.optionGroup(group)) },
    rest,
    reserved: RESERVED,
    ref,
    render,
  });
  return (
    <SelectGroupContext value={group}>
      {renderElement<SelectRenderProps, undefined>(render, 'div', props, undefined)}
    </SelectGroupContext>
  );
}

/**
 * A group of items with a label. It renders a `<div role="group">` that its `Select.Label` names. Disabling the group disables every item in it.
 *
 * @example
 * <Select.Group>
 *   <Select.Label>Desserts</Select.Label>
 *   <Select.Item value="Cake">
 *     <Select.ItemIndicator />
 *     <Select.ItemText>Cake</Select.ItemText>
 *   </Select.Item>
 * </Select.Group>
 * @cckPart optionGroup
 * @param props - The Group props.
 * @returns The rendered group.
 */
export const SelectGroup: SelectPart<SelectGroupProps> = Object.assign(SelectGroupImpl, {
  displayName: 'Select.Group',
});
