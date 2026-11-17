'use client';

import type { ReactElement } from 'react';
import { toReactProps } from '@cocokits/react-core';
import { renderElement } from '../internal/render-element';
import { useSelectContext } from './select-context';
import type { SelectEmptyProps } from './select-extra-parts.types';
import type { SelectPart, SelectRenderProps } from './select.types';
import { useSelectPartProps } from './use-select-part';

/** The attributes the machine owns; a consumer value can never replace them. */
const RESERVED = ['role'];

function SelectEmptyImpl({ render, ref, ...rest }: SelectEmptyProps): ReactElement {
  const context = useSelectContext<unknown>('Select.Empty');
  // Present on the list while the search is on and no option matches the query.
  const shown = context.parts.content['data-empty'] !== undefined;
  const props = useSelectPartProps({
    ours: { ...context.theme.empty, ...toReactProps(context.parts.empty) },
    rest,
    reserved: RESERVED,
    ref,
    render,
  });
  // The live region exists while the list is open and empty, so its text is inserted when nothing matches.
  return renderElement<SelectRenderProps, undefined>(
    render,
    'div',
    { ...props, children: shown ? rest.children : undefined },
    undefined,
  );
}

/**
 * What the list says while no option matches the query of the search. It renders a `<div role="status">` inside
 * `Select.Content`, so a screen reader announces it politely. The element is there while the list is open and
 * empty while an option matches, so its text is inserted when nothing matches and the announcement fires.
 *
 * @example
 * <Select.Empty>No dish found</Select.Empty>
 * @cckPart empty
 * @param props - The Empty props.
 * @returns The rendered element, empty while an option matches.
 */
export const SelectEmpty: SelectPart<SelectEmptyProps> = Object.assign(SelectEmptyImpl, {
  displayName: 'Select.Empty',
});
