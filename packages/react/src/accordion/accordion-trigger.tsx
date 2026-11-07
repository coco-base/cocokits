'use client';

import { isValidElement, type KeyboardEvent, type MouseEvent, type ReactElement, type Ref } from 'react';
import { accordionAnatomy } from '@cocokits/machines/accordion';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { nonNativeButtonProps, useElementKind } from '../internal/button-kind';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { useAccordionContext, useAccordionItemContext } from './accordion-context';
import type { AccordionItemState, AccordionPart, AccordionRenderProps, AccordionTriggerProps } from './accordion.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes that state the item; a consumer value can never replace them. */
const RESERVED = [
  'id',
  'aria-expanded',
  'aria-controls',
  'aria-disabled',
  'data-state',
  'data-disabled',
  'data-orientation',
  'data-focus-visible',
];

function AccordionTriggerImpl({ nativeButton = true, render, ref, ...rest }: AccordionTriggerProps): ReactElement {
  const root = useAccordionContext('Accordion.Trigger');
  const item = useAccordionItemContext('Accordion.Trigger');
  const themeAttrs = useThemeAttrs(accordionAnatomy).trigger;
  const { trigger } = item.parts;
  const machineProps = withoutReserved(
    toReactProps(trigger),
    nativeButton ? ['onClick', 'onKeyDown'] : ['onClick', 'onKeyDown', 'type', 'disabled'],
  );
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useElementKind(
    'Accordion.Trigger',
    nativeButton,
    useMergedRef<HTMLElement>(ref, elementRef, item.triggerRef),
  );

  const { onKeyDown: activateKey, ...nonNative } = nativeButton ? {} : nonNativeButtonProps();
  const ours = {
    ...themeAttrs,
    ...machineProps,
    ...nonNative,
    // A disabled non-native trigger has no `disabled` attribute to stop the click and the tab stop.
    ...(!nativeButton && item.disabled ? { 'aria-disabled': 'true', tabIndex: -1 } : {}),
    onClick: (event: MouseEvent<HTMLElement>) => {
      if (!nativeButton && item.disabled) return;
      trigger.onClick(event.nativeEvent);
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      trigger.onKeyDown(event.nativeEvent);
      // A native button clicks on Enter and Space itself; another element does it here.
      (activateKey as ((event: KeyboardEvent<HTMLElement>) => void) | undefined)?.(event);
    },
    onFocus: () => {
      root.focusTrigger(item.value);
    },
    onBlur: () => {
      root.blurTrigger();
    },
    ref: mergedRef,
  };
  const props = mergeProps(ours, withoutReserved(rest, RESERVED)) as unknown as AccordionRenderProps;
  return renderElement<AccordionRenderProps, AccordionItemState>(render, 'button', props, {
    open: item.open,
    disabled: item.disabled,
    orientation: root.orientation,
  });
}

/**
 * Renders the `<button type="button">` that opens and closes its item. It carries `aria-expanded`,
 * `aria-controls` while the content is in the document, native `disabled` when the item is disabled, and
 * `aria-disabled="true"` while it is the open trigger of a single accordion that is not `collapsible`. With
 * `nativeButton={false}` it renders another element through `render` and gives it `role="button"`, `tabindex="0"`
 * and Enter and Space activation, and no `type`. Native button props pass through, and `ref` reaches the element.
 * Compose it with another component through `render`.
 *
 * @example
 * <Accordion.Trigger>Shipping</Accordion.Trigger>
 * @cckPart trigger
 * @param props - The Trigger props.
 * @returns The rendered element.
 */
export const AccordionTrigger: AccordionPart<AccordionTriggerProps> = Object.assign(AccordionTriggerImpl, {
  displayName: 'Accordion.Trigger',
});
