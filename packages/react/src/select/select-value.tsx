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
 * The text that the trigger shows. It renders a `<span>` with the placeholder while nothing is selected, and with the selected labels, joined with a comma, otherwise.
 *
 * The labels come from the `items` of the Root, then from `itemToStringLabel`, then from the value as text. So they are in the server render. Give it children to show something else. Native `span` props pass through.
 *
 * @example
 * <Select.Value placeholder="Choose a dish" />
 * @typeParam V - The type of the value that the children function receives.
 * @cckPart value
 * @cckPart placeholder
 * @param props - The Value props.
 * @returns The rendered value.
 */
export const SelectValue: SelectValueComponent = Object.assign(SelectValueImpl, {
  displayName: 'Select.Value',
});
