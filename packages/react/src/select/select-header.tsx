'use client';

import type { ReactElement } from 'react';
import { toReactProps } from '@cocokits/react-core';
import { renderElement } from '../internal/render-element';
import { useSelectContext } from './select-context';
import type { SelectHeaderProps } from './select-extra-parts.types';
import type { SelectPart, SelectRenderProps } from './select.types';
import { useSelectPartProps } from './use-select-part';

function SelectHeaderImpl({ render, ref, ...rest }: SelectHeaderProps): ReactElement | null {
  const context = useSelectContext<unknown>('Select.Header');
  const props = useSelectPartProps({
    ours: { ...context.theme.header, ...toReactProps(context.parts.header) },
    rest,
    reserved: [],
    ref,
    render,
  });
  return context.filter ? renderElement<SelectRenderProps, undefined>(render, 'div', props, undefined) : null;
}

/**
 * The area above the options, for a Select with `filter`. It renders a `<div>` inside `Select.Content` that holds the
 * `Select.Search`. The options and their groups follow it. Without `filter` it renders nothing.
 *
 * @example
 * <Select.Header>
 *   <Select.Search />
 * </Select.Header>
 * @cckPart header
 * @param props - The Header props.
 * @returns The rendered element, or nothing without `filter`.
 */
export const SelectHeader: SelectPart<SelectHeaderProps, ReactElement | null> = Object.assign(SelectHeaderImpl, {
  displayName: 'Select.Header',
});
