'use client';

import { useContext, type ReactElement } from 'react';
import { toReactProps } from '@cocokits/react-core';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { SelectItemContext, useSelectContext } from './select-context';
import type { SelectOptionDescriptionProps } from './select-extra-parts.types';
import type { SelectPart, SelectRenderProps } from './select.types';
import { useSelectPartProps } from './use-select-part';

/** The attributes the machine owns; the option's `aria-describedby` points at `id`. */
const RESERVED = ['id'];

function SelectOptionDescriptionImpl({ render, ref, ...rest }: SelectOptionDescriptionProps): ReactElement {
  const context = useSelectContext<unknown>('Select.OptionDescription');
  const item = useContext(SelectItemContext);
  if (item === null) throw new Error('CocoKits: <Select.OptionDescription> must be placed within <Select.Item>.');
  const { registerDescription } = item;
  // The option is described by this part while it is mounted.
  useIsomorphicLayoutEffect(() => registerDescription(), [registerDescription]);
  const props = useSelectPartProps({
    ours: { ...context.theme.optionDescription, ...toReactProps(context.parts.optionDescription(item.item)) },
    rest,
    reserved: RESERVED,
    ref,
    render,
  });
  return renderElement<SelectRenderProps, undefined>(render, 'span', props, undefined);
}

/**
 * A smaller text under the text of an option, such as a hint. It renders a `<span>` inside `Select.Item`, and the
 * option points to it with `aria-describedby` while it is mounted, so a screen reader reads it after the option.
 *
 * @example
 * <Select.Item value="pizza">
 *   <Select.ItemText>Pizza</Select.ItemText>
 *   <Select.OptionDescription>Baked in a stone oven</Select.OptionDescription>
 * </Select.Item>
 * @cckPart optionDescription
 * @param props - The OptionDescription props.
 * @returns The rendered span.
 */
export const SelectOptionDescription: SelectPart<SelectOptionDescriptionProps> = Object.assign(
  SelectOptionDescriptionImpl,
  { displayName: 'Select.OptionDescription' },
);
