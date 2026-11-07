'use client';

import type { ReactElement, ReactNode } from 'react';
import { toReactProps } from '@cocokits/react-core';
import { renderElement } from '../internal/render-element';
import { useSelectContext } from './select-context';
import type { SelectRenderProps, SelectValueComponent, SelectValueProps } from './select.types';
import { useSelectPartProps } from './use-select-part';

function SelectValueImpl<V = unknown>({
  placeholder = '',
  children,
  render,
  ref,
  ...rest
}: SelectValueProps<V>): ReactElement {
  const context = useSelectContext<unknown>('Select.Value');
  const { empty, theme, parts } = context;
  const part = empty ? 'placeholder' : 'value';
  const props = useSelectPartProps({
    ours: { ...theme[part], ...toReactProps(parts[part]) },
    rest,
    reserved: [],
    ref,
    render,
  });
  let content: ReactNode;
  if (empty) content = placeholder;
  else if (typeof children === 'function') content = children(context.selectedValue as V);
  else content = children ?? context.valueText;
  return renderElement<SelectRenderProps, undefined>(render, 'span', { ...props, children: content }, undefined);
}

/**
 * Renders what the trigger shows: a `<span>` (or your `render` element) with the placeholder while nothing is
 * selected, and the selected labels joined with `, ` otherwise. The labels come from the Root's `items`, else
 * `itemToStringLabel`, else the value as text, so they are in the server render. Give it children to show
 * something else: a node, or a function of the value (a `T`, or the list with `multiple`) that is not called while
 * nothing is selected. Native span props pass through.
 *
 * @example
 * <Select.Value placeholder="Choose a dish" />
 * @typeParam V - The type of the value the children function receives.
 * @cckPart value
 * @cckPart placeholder
 * @param props - The Value props.
 * @returns The rendered value.
 */
export const SelectValue: SelectValueComponent = Object.assign(SelectValueImpl, {
  displayName: 'Select.Value',
});
