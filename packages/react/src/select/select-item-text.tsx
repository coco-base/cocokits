'use client';

import { useContext, type ReactElement } from 'react';
import { toReactProps } from '@cocokits/react-core';
import { renderElement } from '../internal/render-element';
import { SelectItemContext, useSelectContext } from './select-context';
import type { SelectPart, SelectRenderProps } from './select.types';
import type { SelectItemTextProps } from './select-parts.types';
import { useSelectPartProps } from './use-select-part';

function SelectItemTextImpl({ render, ref, ...rest }: SelectItemTextProps): ReactElement {
  const context = useSelectContext<unknown>('Select.ItemText');
  const item = useContext(SelectItemContext);
  if (item === null) throw new Error('CocoKits: <Select.ItemText> must be placed within <Select.Item>.');
  // The item reads the text of this element when a key is pressed; the element is not a label the Root renders.
  const props = useSelectPartProps({
    ours: { ...context.theme.optionContent, ...toReactProps(context.parts.optionContent) },
    rest,
    reserved: [],
    ref,
    render,
    internalRef: item.setTextElement,
  });
  return renderElement<SelectRenderProps, undefined>(render, 'span', props, undefined);
}

/**
 * Renders the text of an item: a `<span>` (or your `render` element). Type-to-search matches its text unless the
 * item has a `textValue`. Native span props pass through.
 *
 * @example
 * <Select.ItemText>Cake</Select.ItemText>
 * @cckPart optionContent
 * @param props - The ItemText props.
 * @returns The rendered text.
 */
export const SelectItemText: SelectPart<SelectItemTextProps> = Object.assign(SelectItemTextImpl, {
  displayName: 'Select.ItemText',
});
