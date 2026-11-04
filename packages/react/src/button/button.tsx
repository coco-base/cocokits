'use client';

import { isValidElement, useEffect, useCallback, useRef, type ReactElement, type Ref } from 'react';
import { useThemeAttrs, toReactProps } from '@cocokits/react-core';
import { buttonAnatomy, getButtonProps } from '@cocokits/machines/button';
import { isDevelopment } from '../internal/dev';
import { mergeProps } from '../internal/merge-props';
import { useMergedRef } from '../internal/use-merged-ref';
import { renderElement } from '../internal/render-element';
import type { ButtonProps, ButtonRenderProps, ButtonState } from './button.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** Logs a `CocoKits:` error when the rendered tag does not match the element kind. */
function checkElementKind(element: Element | null, nativeButton: boolean): void {
  if (!element || !isDevelopment()) return;
  const tag = element.tagName.toLowerCase();
  if (nativeButton && tag !== 'button') {
    console.error(
      `CocoKits: <Button> renders a native <button>, but its element is <${tag}>. Pass nativeButton={false} to render a link, or render a <button>.`,
    );
  } else if (!nativeButton && tag === 'button') {
    console.error(
      'CocoKits: <Button nativeButton={false}> renders a link, but its element is a <button>. Remove nativeButton={false}, or render an <a>.',
    );
  } else if (!nativeButton && tag !== 'a') {
    console.error(
      `CocoKits: <Button nativeButton={false}> renders a link, which must be an <a> (or a component that renders one), but its element is <${tag}>.`,
    );
  }
}

function ButtonImpl({
  disabled = false,
  render,
  nativeButton = true,
  ref,
  children,
  ...rest
}: ButtonProps): ReactElement {
  const element = nativeButton ? 'button' : 'a';
  const { onClick: guard, ...machineProps } = toReactProps(getButtonProps({ element, disabled }));
  const themeAttrs = useThemeAttrs(buttonAnatomy).root;

  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const node = useRef<HTMLElement | null>(null);
  const trackNode = useCallback((element: HTMLElement | null) => {
    node.current = element;
  }, []);
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, trackNode);
  useEffect(() => {
    checkElementKind(node.current, nativeButton);
  }, [nativeButton]);

  // The guard is the capture-phase handler of the root: it runs before any native listener of the
  // element and stops the click, so no bubble-phase `onClick` runs. The merge puts a consumer
  // `onClickCapture` (the Button's or the element's) first, and its `preventDefault()` vetoes the guard.
  const ours = {
    ...themeAttrs,
    ...machineProps,
    ...(element === 'button' ? { type: 'button' } : {}),
    ...(guard ? { onClickCapture: guard } : {}),
    ref: mergedRef,
    children,
  };
  const props = mergeProps(ours, rest) as unknown as ButtonRenderProps;
  return renderElement<ButtonRenderProps, ButtonState>(render, element, props, { disabled });
}

/** The {@link Button} component and its `displayName`. */
interface ButtonComponent {
  (props: ButtonProps): ReactElement;
  displayName: string;
}

/**
 * Renders a `<button>` with `type="button"`, or link semantics (an `<a>`, or a link component that
 * renders one) with `render` and `nativeButton={false}`. A disabled `<button>` takes native
 * `disabled`; a disabled link gets `aria-disabled="true"` and `tabindex="-1"`, and its activation is
 * blocked in the capture phase, before any other click listener of the element: a consumer
 * `onClickCapture` runs first and may veto with `preventDefault()`, otherwise no `onClick` of the
 * Button or of the element given through `render` runs. Native button props pass through, and `ref`
 * reaches the element.
 *
 * The name is its content. An icon-only Button needs `aria-label` or `aria-labelledby`.
 *
 * @example
 * <Button onClick={save}>Save</Button>
 * @cckPart root
 * @param props - The Button props.
 * @returns The rendered element.
 */
export const Button: ButtonComponent = Object.assign(ButtonImpl, { displayName: 'Button' });
