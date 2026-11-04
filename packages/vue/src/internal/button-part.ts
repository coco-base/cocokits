import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';
import { omit } from './record';

/**
 * What a button-default part renders: the native `button` (`as` is `'button'`, no `asChild`), the child the
 * author composed (`asChild`, which keeps its own semantics), or another tag or component given to `as`.
 */
export type ButtonPartKind = 'native' | 'child' | 'non-native';

/**
 * The kind of a button-default part. The API decides it: Vue never inspects the rendered element.
 *
 * @internal
 * @param as - The `as` prop of the part (`'button'` when unset).
 * @param asChild - The `asChild` prop of the part.
 * @returns The kind.
 */
export function buttonPartKind(as: AsTag | Component | undefined, asChild: boolean | undefined): ButtonPartKind {
  if (asChild) return 'child';
  return (as ?? 'button') === 'button' ? 'native' : 'non-native';
}

/**
 * The machine props of a button-default part with `type` only on the native button: a link has no use for it, and
 * a composed child keeps its own.
 *
 * @internal
 * @param kind - The kind of the part.
 * @param props - The props the machine computed.
 * @returns The props, without `type` unless the part is a native button.
 */
export function typedForKind(kind: ButtonPartKind, props: object): Record<string, unknown> {
  return kind === 'native' ? { ...props } : omit(props, 'type');
}

function isLink(element: Element): boolean {
  return element.localName === 'a' && element.hasAttribute('href');
}

function onKeydown(event: KeyboardEvent): void {
  const element = event.currentTarget;
  if (!(element instanceof HTMLElement) || event.target !== element || event.isComposing) return;
  // Space scrolls the page on keydown; it activates on keyup.
  if (event.key === ' ') event.preventDefault();
  // A consumer listener runs first and may veto. A link keeps the browser's own Enter activation.
  else if (event.key === 'Enter' && !event.defaultPrevented && !isLink(element)) {
    event.preventDefault();
    element.click();
  }
}

function onKeyup(event: KeyboardEvent): void {
  const element = event.currentTarget;
  if (!(element instanceof HTMLElement) || event.target !== element || event.isComposing) return;
  if (event.key === ' ' && !event.defaultPrevented) element.click();
}

/**
 * What a Dialog or Popover trigger or Close gets on an element that is not a native button, the way Base UI's
 * `useButton` does it, besides {@link NON_NATIVE_DEFAULTS}: Enter on keydown and Space on keyup, both through a click so the
 * part's click logic and a consumer `click` listener run. Bind it after the author's attrs, so their listeners
 * run first and can veto with `preventDefault()`.
 *
 * @internal
 * @returns The attrs and listeners to merge onto the part.
 */
export function nonNativePress(): Record<string, unknown> {
  return { onKeydown, onKeyup };
}

/**
 * The role and tab stop of a button-default part on an element that is not a native button. Merge it before the
 * author's attrs, so an author's `role` or `tabindex` wins, as the `render` props do in React.
 *
 * @internal
 */
export const NON_NATIVE_DEFAULTS: Readonly<Record<string, unknown>> = { role: 'button', tabindex: 0 };
