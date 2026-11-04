'use client';

import { useCallback, useEffect, useRef, type KeyboardEvent, type RefCallback } from 'react';
import { isDevelopment } from './dev';

/** Logs a `CocoKits:` error when the rendered tag does not match `nativeButton`. */
function checkElementKind(part: string, element: Element | null, nativeButton: boolean): void {
  if (!element || !isDevelopment()) return;
  const tag = element.tagName.toLowerCase();
  if (nativeButton && tag !== 'button') {
    console.error(
      `CocoKits: <${part}> expects a native <button>, but its element is <${tag}>. Pass nativeButton={false} to render another element, or render a <button>.`,
    );
  } else if (!nativeButton && tag === 'button') {
    console.error(
      `CocoKits: <${part} nativeButton={false}> expects an element that is not a <button>, but its element is a <button>. Remove nativeButton={false}, or render another element.`,
    );
  }
}

/**
 * Tracks the rendered element of a button-default part and, in development, logs a `CocoKits:` error after
 * mount when its tag does not match `nativeButton`. The element is never inspected to decide the kind.
 *
 * @param part - The part name for the message, such as `Dialog.Trigger`.
 * @param nativeButton - Whether the part renders a native `<button>`.
 * @param ref - The merged ref of the part.
 * @returns The ref to put on the element; it also fills `ref`.
 */
export function useElementKind(
  part: string,
  nativeButton: boolean,
  ref: RefCallback<HTMLElement>,
): RefCallback<HTMLElement> {
  const node = useRef<HTMLElement | null>(null);
  const trackNode = useCallback(
    (element: HTMLElement | null) => {
      node.current = element;
      return ref(element);
    },
    [ref],
  );
  useEffect(() => {
    checkElementKind(part, node.current, nativeButton);
  }, [part, nativeButton]);
  return trackNode;
}

const isLink = (element: HTMLElement): boolean => element.localName === 'a' && element.hasAttribute('href');

/**
 * The props of a button-default part that renders a non-native element (Base UI `useButton`): `role="button"`,
 * `tabIndex` 0, Enter activates on keydown (not on an `<a href>`, which keeps the browser's own activation),
 * Space is kept from scrolling on keydown and activates on keyup. Activation is a click on the element, so
 * the part's click logic and the consumer's `onClick` run. A consumer `preventDefault()` on the keydown or
 * keyup vetoes: the consumer's handler runs first.
 *
 * @returns The props to put under the consumer's.
 */
export function nonNativeButtonProps(): Record<string, unknown> {
  return {
    role: 'button',
    tabIndex: 0,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.defaultPrevented || event.target !== event.currentTarget || event.nativeEvent.isComposing) return;
      if (event.key === ' ') {
        event.preventDefault();
      } else if (event.key === 'Enter' && !isLink(event.currentTarget)) {
        event.preventDefault();
        event.currentTarget.click();
      }
    },
    onKeyUp: (event: KeyboardEvent<HTMLElement>) => {
      if (
        event.defaultPrevented ||
        event.target !== event.currentTarget ||
        event.nativeEvent.isComposing ||
        event.key !== ' '
      )
        return;
      event.currentTarget.click();
    },
  };
}
