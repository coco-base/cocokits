'use client';

import { isValidElement, useCallback, useEffect, useRef, type ReactElement, type Ref } from 'react';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import type { ButtonProps as MachineButtonProps, ButtonRootProps } from '@cocokits/machines/button';
import type { ButtonProps, ButtonRenderProps, ButtonState } from '../button/button.types';
import { isDevelopment } from './dev';
import { mergeProps } from './merge-props';
import { renderElement } from './render-element';
import { useMergedRef } from './use-merged-ref';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** What differs between the components that share the Button implementation. */
export interface ButtonElementOptions {
  /** The component name in messages, such as `Button`. */
  readonly name: string;
  /** The anatomy of the component; its `root` part gets the theme attributes. */
  readonly anatomy: { readonly block: string; readonly parts: { readonly root: object } };
  /** The machine function that gives the root props. */
  readonly getProps: (props: MachineButtonProps) => ButtonRootProps;
}

/** Logs a `CocoKits:` error when the rendered tag does not match the element kind. */
function checkElementKind(name: string, element: Element | null, nativeButton: boolean): void {
  if (!element || !isDevelopment()) return;
  const tag = element.tagName.toLowerCase();
  if (nativeButton && tag !== 'button') {
    console.error(
      `CocoKits: <${name}> renders a native <button>, but its element is <${tag}>. Pass nativeButton={false} to render a link, or render a <button>.`,
    );
  } else if (!nativeButton && tag === 'button') {
    console.error(
      `CocoKits: <${name} nativeButton={false}> renders a link, but its element is a <button>. Remove nativeButton={false}, or render an <a>.`,
    );
  } else if (!nativeButton && tag !== 'a') {
    console.error(
      `CocoKits: <${name} nativeButton={false}> renders a link, which must be an <a> (or a component that renders one), but its element is <${tag}>.`,
    );
  }
}

/**
 * The shared implementation of Button and IconButton: the element, the disabled markers, the capture-phase guard of
 * a disabled link, the merge of the consumer's props and the `render` prop. Call it from the component body.
 *
 * @param props - The component props.
 * @param options - The name, anatomy and machine function of the component.
 * @returns The rendered element.
 */
export function useButtonElement(
  { disabled = false, render, nativeButton = true, ref, children, ...rest }: ButtonProps,
  { name, anatomy, getProps }: ButtonElementOptions,
): ReactElement {
  const element = nativeButton ? 'button' : 'a';
  const { onClick: guard, ...machineProps } = toReactProps(getProps({ element, disabled }));
  const themeAttrs = useThemeAttrs(anatomy).root;

  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const node = useRef<HTMLElement | null>(null);
  const trackNode = useCallback((target: HTMLElement | null) => {
    node.current = target;
  }, []);
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, trackNode);
  useEffect(() => {
    checkElementKind(name, node.current, nativeButton);
  }, [name, nativeButton]);

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
