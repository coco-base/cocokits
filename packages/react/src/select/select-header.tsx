'use client';

import type { ReactElement } from 'react';
import { toReactProps } from '@cocokits/react-core';
import { renderElement } from '../internal/render-element';
import { useSelectContext } from './select-context';
import type { SelectHeaderProps } from './select-extra-parts.types';
import type { SelectPart, SelectRenderProps } from './select.types';
import { useSelectPartProps } from './use-select-part';

function SelectHeaderImpl({ render, ref, ...rest }: SelectHeaderProps): ReactElement {
  const context = useSelectContext<unknown>('Select.Header');
  const props = useSelectPartProps({
    ours: { ...context.theme.header, ...toReactProps(context.parts.header) },
    rest,
    reserved: [],
    ref,
    render,
  });
  return renderElement<SelectRenderProps, undefined>(render, 'div', props, undefined);
}

/**
 * The area above the options. It renders a `<div>` inside `Select.Content` that holds the `Select.Search`. The
 * options and their groups follow it.
 *
 * @example
 * <Select.Header>
 *   <Select.Search />
 * </Select.Header>
 * @cckPart header
 * @param props - The Header props.
 * @returns The rendered element.
 */
export const SelectHeader: SelectPart<SelectHeaderProps> = Object.assign(SelectHeaderImpl, {
  displayName: 'Select.Header',
});
