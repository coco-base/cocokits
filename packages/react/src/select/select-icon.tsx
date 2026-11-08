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
 * The icon that shows the trigger opens a list. It renders a `<span aria-hidden="true">`. Content you give it replaces the icon of the theme.
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
