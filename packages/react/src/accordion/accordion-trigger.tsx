'use client';

import {
  cloneElement,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { accordionAnatomy } from '@cocokits/machines/accordion';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { nonNativeButtonProps, useElementKind } from '../internal/button-kind';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { usePartIconName } from '../internal/part-icon-name';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { SvgIcon } from '../svg-icon';
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
  const allThemeAttrs = useThemeAttrs(accordionAnatomy);
  const themeAttrs = allThemeAttrs.trigger;
  const indicatorIconName = usePartIconName(accordionAnatomy, 'indicator');
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
  const element = renderElement<AccordionRenderProps, AccordionItemState>(render, 'button', props, {
    open: item.open,
    disabled: item.disabled,
    orientation: root.orientation,
  });
  // The indicator is the last child of the trigger, whatever element renders it: it goes after the children of
  // the element that `render` gave back, in the element form and in the function form.
  const indicator = (
    <span {...allThemeAttrs.indicator} {...toReactProps(item.parts.indicator)}>
      {indicatorIconName !== undefined && <SvgIcon iconName={indicatorIconName} />}
    </span>
  );
  return cloneElement(element, undefined, (element.props as { children?: ReactNode }).children, indicator);
}

/**
 * The button that opens and closes its item. It renders a `<button type="button">` with `aria-expanded`. Native
 * button props pass through, and `ref` reaches the element.
 *
 * It has `aria-controls` while the content is in the document, and native `disabled` when the item is disabled.
 * The open trigger of a single accordion without `collapsible` has `aria-disabled="true"`.
 *
 * To render another element or component, use `render`. An element that is not a `<button>` also needs
 * `nativeButton={false}`.
 *
 * The last child of the trigger is the indicator, a `<span aria-hidden="true">` that holds the icon the theme
 * names for it, drawn with `SvgIcon`. It is there whichever element renders the trigger, and its look is the
 * theme's.
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
