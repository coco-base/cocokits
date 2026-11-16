'use client';

import type { ReactElement } from 'react';
import { toReactProps } from '@cocokits/react-core';
import { renderElement } from '../internal/render-element';
import { useSelectContext } from './select-context';
import type { SelectCountProps } from './select-extra-parts.types';
import type { SelectPart, SelectRenderProps } from './select.types';
import { useSelectPartProps } from './use-select-part';

function SelectCountImpl({ children, render, ref, ...rest }: SelectCountProps): ReactElement | null {
  const context = useSelectContext<unknown>('Select.Count');
  const { count } = context.parts;
  const props = useSelectPartProps({
    ours: {
      ...context.theme.count,
      ...(count === null ? {} : { ...toReactProps({ class: count.class }), children: children ?? count.text }),
    },
    rest,
    reserved: [],
    ref,
    render,
  });
  return count === null ? null : renderElement<SelectRenderProps, undefined>(render, 'span', props, undefined);
}

/**
 * The count of the other selected values of a Select with `multiple`. It renders a `<span>` with the text `+N`,
 * where N is the number of selected values after the first one, which `Select.Value` shows.
 *
 * It renders nothing while fewer than two values are selected. Put it in the `Select.Trigger`, after the
 * `Select.Value`. Its text is part of the text of the trigger.
 *
 * @example
 * <Select.Trigger aria-label="Dishes">
 *   <Select.Value placeholder="Choose dishes" />
 *   <Select.Count />
 *   <Select.Icon />
 * </Select.Trigger>
 * @cckPart count
 * @param props - The Count props.
 * @returns The rendered element, or nothing while fewer than two values are selected.
 */
export const SelectCount: SelectPart<SelectCountProps, ReactElement | null> = Object.assign(SelectCountImpl, {
  displayName: 'Select.Count',
});
