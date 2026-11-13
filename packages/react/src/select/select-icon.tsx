'use client';

import type { ReactElement } from 'react';
import { selectAnatomy } from '@cocokits/machines/select';
import { toReactProps } from '@cocokits/react-core';
import { renderElement } from '../internal/render-element';
import { usePartIcon } from '../internal/use-part-icon';
import { SvgIcon } from '../svg-icon';
import { useSelectContext } from './select-context';
import type { SelectPart, SelectRenderProps } from './select.types';
import type { SelectIconProps } from './select-parts.types';
import { useSelectPartProps } from './use-select-part';

/** The attributes the machine owns; a consumer value can never replace them. */
const RESERVED = ['aria-hidden'];

function SelectIconImpl({ render, ref, children, ...rest }: SelectIconProps): ReactElement {
  const context = useSelectContext<unknown>('Select.Icon');
  const iconName = usePartIcon(selectAnatomy, 'dropdownIcon', children);
  const props = useSelectPartProps({
    ours: {
      ...context.theme.dropdownIcon,
      ...toReactProps(context.parts.dropdownIcon),
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
 * The icon that shows the trigger opens a list. It renders a `<span aria-hidden="true">` that holds an icon drawn
 * with `SvgIcon`: your content, else the icon the theme names in `components.select.icons`, else `chevron-down`.
 *
 * Content you give it replaces the icon. A theme icon must be registered, for example with `IconProvider`.
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
