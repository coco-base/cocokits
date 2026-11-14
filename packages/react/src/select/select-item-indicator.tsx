'use client';

import { useContext, type ReactElement } from 'react';
import { selectAnatomy } from '@cocokits/machines/select';
import { toReactProps } from '@cocokits/react-core';
import { renderElement } from '../internal/render-element';
import { usePartIcon } from '../internal/use-part-icon';
import { SelectItemContext, useSelectContext } from './select-context';
import { SvgIcon } from '../svg-icon';
import type { SelectPart, SelectRenderProps } from './select.types';
import type { SelectItemIndicatorProps } from './select-parts.types';
import { useSelectPartProps } from './use-select-part';

/** The attributes the machine owns; a consumer value can never replace them. */
const RESERVED = ['aria-hidden'];

function SelectItemIndicatorImpl({ render, ref, children, ...rest }: SelectItemIndicatorProps): ReactElement {
  const context = useSelectContext<unknown>('Select.ItemIndicator');
  const selected = useContext(SelectItemContext)?.selected === true;
  const iconName = usePartIcon(selectAnatomy, 'optionIndicator', children, selected);
  const props = useSelectPartProps({
    ours: {
      ...context.theme.optionIndicator,
      ...toReactProps(context.parts.optionIndicator),
      children: iconName === undefined ? children : <SvgIcon iconName={iconName} />,
    },
    rest,
    reserved: RESERVED,
    ref,
    render,
  });
  return renderElement<SelectRenderProps, undefined>(render, 'span', props, undefined);
}

/**
 * The mark that shows an item is selected: a check, or a box with `multiple`. It renders a `<span aria-hidden="true">`.
 * While its item is selected it holds an icon drawn with `SvgIcon`.
 *
 * @remarks
 * The icon is your content, else the icon the theme names in `components.select.icons`, else the default `check`.
 * Its look comes from the theme and from the `data-selected` of the item.
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
