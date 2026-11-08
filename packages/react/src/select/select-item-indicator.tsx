'use client';

import type { ReactElement } from 'react';
import { toReactProps } from '@cocokits/react-core';
import { renderElement } from '../internal/render-element';
import { useSelectContext } from './select-context';
import type { SelectPart, SelectRenderProps } from './select.types';
import type { SelectItemIndicatorProps } from './select-parts.types';
import { useSelectPartProps } from './use-select-part';

/** The attributes the machine owns; a consumer value can never replace them. */
const RESERVED = ['aria-hidden'];

function SelectItemIndicatorImpl({ render, ref, ...rest }: SelectItemIndicatorProps): ReactElement {
  const context = useSelectContext<unknown>('Select.ItemIndicator');
  const props = useSelectPartProps({
    ours: { ...context.theme.optionIndicator, ...toReactProps(context.parts.optionIndicator) },
    rest,
    reserved: RESERVED,
    ref,
    render,
  });
  return renderElement<SelectRenderProps, undefined>(render, 'span', props, undefined);
}

/**
 * The mark that shows an item is selected: a check, or a box with `multiple`. It renders a `<span aria-hidden="true">`. Its look comes from the theme and from the `data-selected` of the item.
 *
 * @example
 * <Select.ItemIndicator />
 * @cckPart optionIndicator
 * @param props - The ItemIndicator props.
 * @returns The rendered indicator.
 */
export const SelectItemIndicator: SelectPart<SelectItemIndicatorProps> = Object.assign(SelectItemIndicatorImpl, {
  displayName: 'Select.ItemIndicator',
});
