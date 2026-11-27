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
  // Without `filter` the element stays, hidden and empty: the same rendered shape in every framework.
  const shown = context.filter;
  return renderElement<SelectRenderProps, undefined>(
    render,
    'div',
    shown ? props : { ...props, hidden: true, children: undefined },
    undefined,
  );
}

/**
 * The area above the options, for a Select with `filter`.
 *
 * @remarks
 * It renders a `<div>` inside `Select.Content` that holds the search. The options and their groups follow it. Without
 * `filter` it is `hidden` and empty, and the search inside it renders nothing.
 *
 * @example
 * <Select.Header>
 *   <Select.Search />
 * </Select.Header>
 * @cckPart header
 * @param props - The Header props.
 * @returns The rendered element, `hidden` and empty without `filter`.
 */
export const SelectHeader: SelectPart<SelectHeaderProps> = Object.assign(SelectHeaderImpl, {
  displayName: 'Select.Header',
});
