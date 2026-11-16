'use client';

import type { ReactElement } from 'react';
import { toReactProps } from '@cocokits/react-core';
import { renderElement } from '../internal/render-element';
import { useSelectContext } from './select-context';
import type { SelectOptionLeadingProps } from './select-extra-parts.types';
import type { SelectPart, SelectRenderProps } from './select.types';
import { useSelectPartProps } from './use-select-part';

/** The attributes the machine owns; a consumer value can never replace them. */
const RESERVED = ['aria-hidden'];

function SelectOptionLeadingImpl({ render, ref, ...rest }: SelectOptionLeadingProps): ReactElement {
  const context = useSelectContext<unknown>('Select.OptionLeading');
  const props = useSelectPartProps({
    ours: { ...context.theme.optionLeading, ...toReactProps(context.parts.optionLeading) },
    rest,
    reserved: RESERVED,
    ref,
    render,
  });
  return renderElement<SelectRenderProps, undefined>(render, 'span', props, undefined);
}

/**
 * The decorative content before the text of an option, such as an icon or an avatar. It renders a `<span aria-
 * hidden="true">` inside `Select.Item`, so the text of the option names the option.
 *
 * @example
 * <Select.Item value="house">
 *   <Select.OptionLeading>
 *     <SvgIcon iconName="house" />
 *   </Select.OptionLeading>
 *   <Select.ItemText>House</Select.ItemText>
 * </Select.Item>
 * @cckPart optionLeading
 * @param props - The OptionLeading props.
 * @returns The rendered element.
 */
export const SelectOptionLeading: SelectPart<SelectOptionLeadingProps> = Object.assign(SelectOptionLeadingImpl, {
  displayName: 'Select.OptionLeading',
});
