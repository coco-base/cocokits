import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import type { PointerDownOutsideEvent } from '../internal/dismiss-handlers';
import type { OverlayPositioningProps } from '../internal/overlay-positioning.types';
import type { SelectRender } from './select.types';

export type { PointerDownOutsideEvent };

/** The `render` prop every part has; its TSDoc is repeated on each part's props. */
interface SelectRenderOption {
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props that returns an element. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: SelectRender | undefined;
}

/** Props of the {@link SelectIcon}: native `span` props and `render`. Its content, if any, replaces the theme's icon. */
export interface SelectIconProps extends Omit<ComponentPropsWithRef<'span'>, 'color'>, SelectRenderOption {
  /**
   * The icon to draw in place of the icon of the theme. When not set, the icon of the theme shows.
   *
   * @example
   * <Select.Icon>
   *   <svg aria-hidden="true" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4" /></svg>
   * </Select.Icon>
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
}

/** Props of the {@link SelectItemText}: native `span` props and `render`. */
export interface SelectItemTextProps extends Omit<ComponentPropsWithRef<'span'>, 'color'>, SelectRenderOption {
  /**
   * The text of the item. Type-to-search matches it, and the trigger can show it. When not set, the item shows no
   * text.
   *
   * It must not be interactive.
   *
   * @example
   * <Select.ItemText>Pasta</Select.ItemText>
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
}

/** Props of the {@link SelectItemIndicator}: native `span` props and `render`. */
export interface SelectItemIndicatorProps extends Omit<ComponentPropsWithRef<'span'>, 'color'>, SelectRenderOption {
  /**
   * A mark to draw in place of the mark of the theme. When not set, the mark of the theme shows.
   *
   * @example
   * <Select.ItemIndicator>✓</Select.ItemIndicator>
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
}

/** Props of the {@link SelectLabel}: native `div` props and `render`. */
export interface SelectLabelProps extends Omit<ComponentPropsWithRef<'div'>, 'color'>, SelectRenderOption {
  /**
   * The label of the group, as text or markup. It must not be interactive. When not set, the group has no name.
   *
   * @example
   * <Select.Label>Hot dishes</Select.Label>
   * @cckSemantic select.label
   */
  readonly children?: ReactNode | undefined;
}

/** Props of the {@link SelectSeparator}: native `div` props and `render`. */
export interface SelectSeparatorProps extends Omit<ComponentPropsWithRef<'div'>, 'color'>, SelectRenderOption {}

/** Props of the {@link SelectContent}. Native `div` props pass through. */
export interface SelectContentProps extends Omit<ComponentPropsWithRef<'div'>, 'color'>, OverlayPositioningProps {
  /**
   * The items, the groups and the separators. When not set, the list is empty.
   *
   * @example
   * <Select.Content>
   *   <Select.Item value="pasta">
   *     <Select.ItemText>Pasta</Select.ItemText>
   *   </Select.Item>
   *   <Select.Separator />
   *   <Select.Item value="soup">
   *     <Select.ItemText>Soup</Select.ItemText>
   *   </Select.Item>
   * </Select.Content>
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The side of the trigger (or the field box) where the list prefers to open. `start` and `end` follow the text direction. The list opens on the other side when there is no room.
   * @cckSemantic select.content.side
   * @defaultValue 'bottom'
   */
  readonly side?: OverlaySide | undefined;
  /**
   * How the list lines up with the edge of the trigger.
   * @cckSemantic select.content.align
   * @defaultValue 'start'
   */
  readonly align?: OverlayAlign | undefined;
  /**
   * Whether the closed list stays in the document, hidden. It then has `hidden` and `data-state="closed"`, and its items stay mounted. Nothing is rendered on the server.
   *
   * When not set, the closed list is not in the document.
   *
   * @cckSemantic select.content.forceMount
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly forceMount?: boolean | undefined;
  /**
   * Called when the user presses Escape with the list open, before it closes. Call `event.preventDefault()` to keep the list open. When not set, Escape closes the list.
   *
   * A Select that Escape cannot close is harder to leave with the keyboard. Keep the refusal short. A focus leave is never refused and always closes the
   * list, and so does choosing an item in a single Select.
   *
   * @example
   * <Select.Content onEscapeKeyDown={(event) => saving && event.preventDefault()}>
   *   ...
   * </Select.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onEscapeKeyDown?: ((event: KeyboardEvent) => void) | undefined;
  /**
   * Called when the user presses outside the list and the trigger, before the list closes. The press is `event.detail.originalEvent`. Call `event.preventDefault()` to keep the list open.
   *
   * The press then leaves the focus on the trigger. When not set, the press closes the list.
   *
   * @example
   * <Select.Content onPointerDownOutside={(event) => event.preventDefault()}>
   *   ...
   * </Select.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onPointerDownOutside?: ((event: PointerDownOutsideEvent) => void) | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props that returns an element. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
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
   * The value of the item. The Select holds it when the user chooses the item. In a single Select, an item with the value `null` or `''` clears the value and shows the placeholder.
   * @cckSemantic select.option.value
   */
  readonly value: T | null;
  /**
   * Whether the item is disabled. The user cannot choose it, and keys skip it. A disabled group also disables it.
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The text that type-to-search matches. When not set, the text of the `Select.ItemText` counts, and then the label of the value.
   * @cckSemantic select.option.textValue
   * @cckParity Not available in every framework.
   */
  readonly textValue?: string | undefined;
  /**
   * The `id` of the item element. The trigger uses it as `aria-activedescendant` while the item is highlighted. When not set, an id is made for you.
   * @cckSemantic select.option.id
   * @defaultValue generated
   * @cckParity A native `id` on the item element.
   */
  readonly id?: string | undefined;
  /**
   * The content of the item: a `Select.ItemIndicator` and a `Select.ItemText`. It must not be interactive.
   * When not set, the item shows no text.
   *
   * @example
   * <Select.Item value="pasta">
   *   <Select.ItemIndicator />
   *   <Select.ItemText>Pasta</Select.ItemText>
   * </Select.Item>
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props that returns an element. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: SelectRender | undefined;
}

/** Props of the {@link SelectGroup}. Native `div` props pass through. */
export interface SelectGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * Whether the group is disabled. The user cannot choose its items.
   * @defaultValue false
   * @cckSemantic select.optionGroup.disabled
   */
  readonly disabled?: boolean | undefined;
  /**
   * A `Select.Label` and the items of the group. When not set, the group is empty.
   *
   * @example
   * <Select.Group>
   *   <Select.Label>Hot dishes</Select.Label>
   *   <Select.Item value="soup">
   *     <Select.ItemText>Soup</Select.ItemText>
   *   </Select.Item>
   * </Select.Group>
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props that returns an element. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: SelectRender | undefined;
}

/** The {@link SelectItem}: a generic function component, `Select.Item<T>`, with its `displayName`. */
export interface SelectItemComponent {
  <T = string>(props: SelectItemProps<T>): ReactElement;
  displayName: string;
}
