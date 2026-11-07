'use client';

import type { ReactElement } from 'react';
import { toReactProps } from '@cocokits/react-core';
import { renderElement } from '../internal/render-element';
import { useSelectContext, useSelectGroup } from './select-context';
import type { SelectPart, SelectRenderProps } from './select.types';
import type { SelectLabelProps } from './select-parts.types';
import { useSelectPartProps } from './use-select-part';

/** The attributes the machine owns; a consumer value can never replace them. */
const RESERVED = ['id'];

function SelectLabelImpl({ render, ref, ...rest }: SelectLabelProps): ReactElement {
  const context = useSelectContext<unknown>('Select.Label');
  const group = useSelectGroup('Select.Label');
  const props = useSelectPartProps({
    ours: { ...context.theme.optionGroupLabel, ...toReactProps(context.parts.optionGroupLabel(group)) },
    rest,
    reserved: RESERVED,
    ref,
    render,
  });
  return renderElement<SelectRenderProps, undefined>(render, 'div', props, undefined);
}

/**
 * Renders the label of a group: a `<div>` (or your `render` element) that the group refers to with
 * `aria-labelledby`. Its content is text or markup, never a control. Native div props pass through.
 *
 * @example
 * <Select.Label>Desserts</Select.Label>
 * @cckPart optionGroupLabel
 * @param props - The Label props.
 * @returns The rendered label.
 */
export const SelectLabel: SelectPart<SelectLabelProps> = Object.assign(SelectLabelImpl, {
  displayName: 'Select.Label',
});
