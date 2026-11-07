'use client';

import { useContext, useEffect, useId, useMemo, useRef, type ReactElement } from 'react';
import { toReactProps } from '@cocokits/react-core';
import { hasInteractiveContent } from '@cocokits/utils';
import { isDevelopment } from '../internal/dev';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { SelectGroupContext, SelectItemContext, useSelectContext } from './select-context';
import type { SelectRenderProps } from './select.types';
import type { SelectItemComponent, SelectItemProps } from './select-parts.types';
import { useSelectPartProps } from './use-select-part';

/** The attributes the machine owns; a consumer value can never replace them. */
const RESERVED = ['role', 'aria-selected', 'aria-disabled', 'data-selected', 'data-highlighted', 'data-disabled'];

function SelectItemImpl<T = string>({
  value,
  disabled = false,
  textValue,
  id,
  ref,
  render,
  ...rest
}: SelectItemProps<T>): ReactElement {
  const context = useSelectContext<T | null>('Select.Item');
  const group = useContext(SelectGroupContext);
  const key = useId();
  const element = useRef<HTMLElement | null>(null);
  const textElement = useRef<HTMLElement | null>(null);
  const isDisabled = disabled || group?.disabled === true;
  const { registerItem } = context;

  // The Root reads the value and the text through this ref, so a new object with the same meaning (an inline
  // `value={{ ... }}`) needs no registry update. Declared first: it runs before the registration below.
  const latest = useRef({ value, textValue });
  useIsomorphicLayoutEffect(() => {
    latest.current = { value, textValue };
  });

  // Registers once per key, and again when the disabled fact or the id changes; the Root keeps the items in
  // document order. Only the DOM node is registered: the Root renders no label from an item.
  useIsomorphicLayoutEffect(() => {
    const node = element.current;
    if (!node) return undefined;
    return registerItem({
      key,
      element: node,
      get value() {
        return latest.current.value;
      },
      disabled: isDisabled,
      id,
      get text() {
        return latest.current.textValue ?? textElement.current?.textContent;
      },
    });
  }, [registerItem, key, isDisabled, id]);

  const itemContext = useMemo(
    () => ({
      setTextElement: (node: HTMLElement | null) => {
        textElement.current = node;
      },
    }),
    [],
  );

  useEffect(() => {
    if (!isDevelopment()) return;
    if (element.current && hasInteractiveContent(element.current)) {
      console.warn(
        'CocoKits: a <Select.Item> holds a focusable or interactive element. An item is not interactive: use plain text and markup.',
      );
    }
  }, []);

  const optionProps = context.parts.option({ key, value, disabled: isDisabled, ...(id === undefined ? {} : { id }) });
  const props = useSelectPartProps({
    ours: { ...context.theme.option, ...toReactProps(optionProps) },
    rest,
    reserved: RESERVED,
    ref,
    render,
    internalRef: element,
  });
  return (
    <SelectItemContext value={itemContext}>
      {renderElement<SelectRenderProps, undefined>(render, 'div', props, undefined)}
    </SelectItemContext>
  );
}

/**
 * Renders an item of the Select: a `<div role="option">` (or your `render` element). Put a `Select.ItemIndicator`
 * and a `Select.ItemText` inside it, never a control. In a single Select an item whose value is `null` or `''`
 * clears the value and shows the placeholder. A press or a click chooses it unless it is disabled; a
 * `preventDefault()` in your own `onClick` vetoes the choice, and `details.cancel()` in `onValueChange` refuses
 * it. The text type-to-search matches is the `textValue`, else the text of the `Select.ItemText`, else the label of
 * the value. Native div props pass through; `id` becomes the option id.
 *
 * @example
 * <Select.Item value="Cake">
 *   <Select.ItemIndicator />
 *   <Select.ItemText>Cake</Select.ItemText>
 * </Select.Item>
 * @typeParam T - The type of the value. Defaults to `string`.
 * @cckPart option
 * @param props - The Item props.
 * @returns The rendered item.
 */
export const SelectItem: SelectItemComponent = Object.assign(SelectItemImpl, {
  displayName: 'Select.Item',
});
