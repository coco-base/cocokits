import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import type { PointerDownOutsideEvent } from '../internal/dismiss-handlers';
import type { OverlayPositioningProps } from '../internal/overlay-positioning.types';
import type { SelectRender } from './select.types';

export type { PointerDownOutsideEvent };

/** The `render` prop every part has; its TSDoc is repeated on each part's props. */
interface SelectRenderOption {
  /**
   * Replaces the rendered element: an element, or a function of the merged props. The part keeps its classes and
   * `data-*`. The function form must spread all the props it receives, including `ref`, onto one element.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular puts the directive on your element and Vue uses `as` or `asChild`.
   */
  readonly render?: SelectRender | undefined;
}

/** Props of the {@link SelectIcon}: native `span` props and `render`. Its content, if any, replaces the theme's icon. */
export interface SelectIconProps extends Omit<ComponentPropsWithRef<'span'>, 'color'>, SelectRenderOption {
  /**
   * The icon to draw in place of the theme's icon; empty keeps the theme's icon.
   *
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
}

/** Props of the {@link SelectItemText}: native `span` props and `render`. */
export interface SelectItemTextProps extends Omit<ComponentPropsWithRef<'span'>, 'color'>, SelectRenderOption {
  /**
   * The text of the item: what typeahead matches and the trigger shows. Never a control.
   *
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
}

/** Props of the {@link SelectItemIndicator}: native `span` props and `render`. */
export interface SelectItemIndicatorProps extends Omit<ComponentPropsWithRef<'span'>, 'color'>, SelectRenderOption {
  /**
   * A mark to draw in place of the theme's mark; empty keeps the theme's mark.
   *
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
}

/** Props of the {@link SelectLabel}: native `div` props and `render`. */
export interface SelectLabelProps extends Omit<ComponentPropsWithRef<'div'>, 'color'>, SelectRenderOption {
  /**
   * The label of the group: text or markup, never a control.
   *
   * @cckSemantic select.label
   */
  readonly children?: ReactNode | undefined;
}

/** Props of the {@link SelectSeparator}: native `div` props and `render`. */
export interface SelectSeparatorProps extends Omit<ComponentPropsWithRef<'div'>, 'color'>, SelectRenderOption {}

/** Props of the {@link SelectContent}. Native `div` props pass through. */
export interface SelectContentProps extends Omit<ComponentPropsWithRef<'div'>, 'color'>, OverlayPositioningProps {
  /**
   * The items, groups and separators.
   *
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The side of the trigger (or the field box) the list prefers. `start` and `end` follow the direction; it
   * flips when there is no room.
   *
   * @defaultValue 'bottom'
   * @cckSemantic select.content.side
   */
  readonly side?: OverlaySide | undefined;
  /**
   * How the list lines up along the anchor's edge.
   *
   * @defaultValue 'start'
   * @cckSemantic select.content.align
   */
  readonly align?: OverlayAlign | undefined;
  /**
   * Keeps the list in the document while the Select is closed, after hydration: it then has `hidden` and
   * `data-state="closed"`, and its items stay mounted. Nothing is rendered on the server. Closed, it has no dismiss
   * layer and no positioning.
   *
   * @defaultValue false
   * @cckSemantic select.content.forceMount
   * @cckParity React and Vue only (Radix and Reka); Angular never keeps the list mounted.
   */
  readonly forceMount?: boolean | undefined;
  /**
   * Called when Escape is pressed with the list open, before it closes. Call `event.preventDefault()` to keep it
   * open. Refusing Escape weakens the pattern, because users expect it to close the list; keep the refusal
   * short-lived. Focus leaving the trigger is never refused.
   *
   * @cckSemantic none
   * @cckParity React and Vue only (Radix and Reka); Angular refuses with `disableClose` on the root.
   */
  readonly onEscapeKeyDown?: ((event: KeyboardEvent) => void) | undefined;
  /**
   * Called when a pointer press lands outside the list and the trigger, before it closes. The press is
   * `event.detail.originalEvent`. Call `event.preventDefault()` to keep it open; the press then leaves the focus
   * on the trigger.
   *
   * @cckSemantic none
   * @cckParity React and Vue only (Radix and Reka); Angular refuses with `disableClose` on the root.
   */
  readonly onPointerDownOutside?: ((event: PointerDownOutsideEvent) => void) | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props. The part keeps its role,
   * classes and `data-*`. The function form must spread all the props it receives, including `ref`, onto one
   * element.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular puts the directive on your element and Vue uses `as` or `asChild`.
   */
  readonly render?: SelectRender | undefined;
}

/**
 * Props of the {@link SelectItem}. Native `div` props pass through; its content must not be interactive.
 *
 * @typeParam T - The type of the value. Defaults to `string`.
 */
export interface SelectItemProps<T = string> extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'children'> {
  /**
   * The value the item stands for. In a single Select an item whose value is `null` or `''` clears the value and
   * shows the placeholder.
   *
   * @cckSemantic select.option.value
   */
  readonly value: T | null;
  /**
   * Whether the item is disabled: it cannot be chosen and keys skip it. Its group adds to it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The text type-to-search matches. Without it the text of the `Select.ItemText` counts, else the label of the
   * value.
   *
   * @cckSemantic select.option.textValue
   * @cckParity Radix's `textValue`; Angular matches the option text.
   */
  readonly textValue?: string | undefined;
  /**
   * The id of the item element, also the trigger's `aria-activedescendant` while it is highlighted. Without it
   * one is made.
   *
   * @cckSemantic select.option.id
   * @defaultValue generated
   * @cckParity Material's option `id`.
   */
  readonly id?: string | undefined;
  /**
   * The content of the item: a `Select.ItemIndicator` and a `Select.ItemText`, never a control.
   *
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props. The part keeps its role,
   * classes and `data-*`. The function form must spread all the props it receives, including `ref`, onto one
   * element.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular puts the directive on your element and Vue uses `as` or `asChild`.
   */
  readonly render?: SelectRender | undefined;
}

/** Props of the {@link SelectGroup}. Native `div` props pass through. */
export interface SelectGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * Whether the group is disabled: its items cannot be chosen.
   *
   * @defaultValue false
   * @cckSemantic select.optionGroup.disabled
   */
  readonly disabled?: boolean | undefined;
  /**
   * A `Select.Label` and the items of the group.
   *
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props. The part keeps its role,
   * classes and `data-*`. The function form must spread all the props it receives, including `ref`, onto one
   * element.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular puts the directive on your element and Vue uses `as` or `asChild`.
   */
  readonly render?: SelectRender | undefined;
}

/** The {@link SelectItem}: a generic function component, `Select.Item<T>`, with its `displayName`. */
export interface SelectItemComponent {
  <T = string>(props: SelectItemProps<T>): ReactElement;
  displayName: string;
}
