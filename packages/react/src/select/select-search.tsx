'use client';

import { useRef, type ChangeEvent, type KeyboardEvent, type ReactElement } from 'react';
import { toReactProps } from '@cocokits/react-core';
import { withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useSelectContext } from './select-context';
import type { SelectSearchProps } from './select-extra-parts.types';
import type { SelectPart, SelectRenderProps } from './select.types';
import { useSelectPartProps } from './use-select-part';

/** The attributes the machine owns; a consumer value can never replace them. */
const RESERVED = [
  'type',
  'role',
  'value',
  'autoComplete',
  'aria-expanded',
  'aria-controls',
  'aria-autocomplete',
  'aria-activedescendant',
];

function SelectSearchImpl({ render, ref, ...rest }: SelectSearchProps): ReactElement {
  const context = useSelectContext<unknown>('Select.Search');
  const { open, parts, layerActiveRef } = context;
  const { search } = parts;
  const input = useRef<HTMLInputElement | null>(null);

  // The focus is in the search input while the list is open: it takes the focus when the list mounts, or opens.
  useIsomorphicLayoutEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  const machine = withoutReserved(toReactProps(search), ['onInput', 'onKeyDown']);
  const props = useSelectPartProps({
    ours: {
      ...context.theme.search,
      ...machine,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        search.onInput(event.nativeEvent);
      },
      onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
        // The list's dismiss layer answers Escape, so that the Content handlers can refuse it.
        if (event.key === 'Escape' && layerActiveRef.current) return;
        search.onKeyDown(event.nativeEvent);
      },
    },
    rest,
    reserved: RESERVED,
    ref,
    render,
    internalRef: input,
  });
  return renderElement<SelectRenderProps, undefined>(render, 'input', props, undefined);
}

/**
 * The search input of the list, for a Select with `filter`. It renders a native `<input type="search">` with the
 * role `combobox`. Put it in the `Select.Header`.
 *
 * The focus stays in this input while the list is open, and `aria-activedescendant` points to the highlighted
 * option. Typing narrows the options to those whose text contains the query, without regard to case, and highlights
 * the first one that is left. Arrow Down and Arrow Up move the highlight, Enter chooses it, Escape closes the list
 * and returns the focus to the trigger, and Tab closes the list.
 *
 * Give it an `aria-label` to change its name, which is "Search" without one.
 *
 * @example
 * <Select.Search aria-label="Search dishes" placeholder="Search" />
 * @cckPart search
 * @param props - The Search props.
 * @returns The rendered input.
 */
export const SelectSearch: SelectPart<SelectSearchProps> = Object.assign(SelectSearchImpl, {
  displayName: 'Select.Search',
});
