'use client';

import type { ReactElement } from 'react';
import { toReactProps } from '@cocokits/react-core';
import { renderElement } from '../internal/render-element';
import { useSelectContext } from './select-context';
import type { SelectFooterProps } from './select-extra-parts.types';
import type { SelectPart, SelectRenderProps } from './select.types';
import { useSelectPartProps } from './use-select-part';

function SelectFooterImpl({ render, ref, ...rest }: SelectFooterProps): ReactElement {
  const context = useSelectContext<unknown>('Select.Footer');
  const props = useSelectPartProps({
    ours: { ...context.theme.footer, ...toReactProps(context.parts.footer) },
    rest,
    reserved: [],
    ref,
    render,
  });
  return renderElement<SelectRenderProps, undefined>(render, 'div', props, undefined);
}

/**
 * The area below the options for your own actions, such as a button that adds a choice. It renders a `<div>`
 * inside `Select.Content`. A press in it does not close the list and does not choose an option.
 *
 * @example
 * <Select.Footer>
 *   <button type="button">Add a dish</button>
 * </Select.Footer>
 * @cckPart footer
 * @param props - The Footer props.
 * @returns The rendered element.
 */
export const SelectFooter: SelectPart<SelectFooterProps> = Object.assign(SelectFooterImpl, {
  displayName: 'Select.Footer',
});
