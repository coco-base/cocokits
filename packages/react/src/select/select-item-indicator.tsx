'use client';

import type { ReactElement } from 'react';
import { toReactProps } from '@cocokits/react-core';
import { renderElement } from '../internal/render-element';
import { useSelectContext } from './select-context';
import type { SelectItemIndicatorProps, SelectPart, SelectRenderProps } from './select.types';
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
 * Renders the decorative mark of an item (a check, or a box with `multiple`): a `<span aria-hidden="true">` (or your
 * `render` element). Its look comes from the theme and the `data-selected` of the item. Native span props pass
 * through.
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
