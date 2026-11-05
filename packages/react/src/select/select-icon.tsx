'use client';

import type { ReactElement } from 'react';
import { toReactProps } from '@cocokits/react-core';
import { renderElement } from '../internal/render-element';
import { useSelectContext } from './select-context';
import type { SelectPart, SelectRenderProps } from './select.types';
import type { SelectIconProps } from './select-parts.types';
import { useSelectPartProps } from './use-select-part';

/** The attributes the machine owns; a consumer value can never replace them. */
const RESERVED = ['aria-hidden'];

function SelectIconImpl({ render, ref, ...rest }: SelectIconProps): ReactElement {
  const context = useSelectContext<unknown>('Select.Icon');
  const props = useSelectPartProps({
    ours: { ...context.theme.dropdownIcon, ...toReactProps(context.parts.dropdownIcon) },
    rest,
    reserved: RESERVED,
    ref,
    render,
  });
  return renderElement<SelectRenderProps, undefined>(render, 'span', props, undefined);
}

/**
 * Renders the decorative dropdown icon: a `<span aria-hidden="true">` (or your `render` element). Its content, if
 * any, replaces the theme's icon. Native span props pass through.
 *
 * @example
 * <Select.Icon />
 * @cckPart dropdownIcon
 * @param props - The Icon props.
 * @returns The rendered icon.
 */
export const SelectIcon: SelectPart<SelectIconProps> = Object.assign(SelectIconImpl, {
  displayName: 'Select.Icon',
});
