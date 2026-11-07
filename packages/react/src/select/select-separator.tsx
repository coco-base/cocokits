'use client';

import type { ReactElement } from 'react';
import { toReactProps } from '@cocokits/react-core';
import { renderElement } from '../internal/render-element';
import { useSelectContext } from './select-context';
import type { SelectPart, SelectRenderProps } from './select.types';
import type { SelectSeparatorProps } from './select-parts.types';
import { useSelectPartProps } from './use-select-part';

/** The attributes the machine owns; a consumer value can never replace them. */
const RESERVED = ['aria-hidden'];

function SelectSeparatorImpl({ render, ref, ...rest }: SelectSeparatorProps): ReactElement {
  const context = useSelectContext<unknown>('Select.Separator');
  const props = useSelectPartProps({
    ours: { ...context.theme.separator, ...toReactProps(context.parts.separator) },
    rest,
    reserved: RESERVED,
    ref,
    render,
  });
  return renderElement<SelectRenderProps, undefined>(render, 'div', props, undefined);
}

/**
 * Renders a decorative line between items or groups: a `<div aria-hidden="true">` (or your `render` element). Keys
 * never land on it. Native div props pass through.
 *
 * @example
 * <Select.Separator />
 * @cckPart separator
 * @param props - The Separator props.
 * @returns The rendered separator.
 */
export const SelectSeparator: SelectPart<SelectSeparatorProps> = Object.assign(SelectSeparatorImpl, {
  displayName: 'Select.Separator',
});
