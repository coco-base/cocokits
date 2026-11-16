import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { MenuItemChangeReason, MenuSubChangeReason } from '@cocokits/machines/menu';
import type { CancelableChangeDetails } from '../internal/cancelable-change-details';
import type { RenderProp } from '../internal/render-element';
import type { ChangeDetails } from '@cocokits/shared';
import type { MenuContentProps, MenuItemProps, MenuItemState, MenuRenderProps, MenuState } from './menu.types';

export type { MenuItemChangeReason, MenuSubChangeReason };

/** What `onCheckedChange` and `onValueChange` receive besides the value: the `reason` and the `event`. */
export type MenuItemChangeDetails = ChangeDetails<MenuItemChangeReason>;

/** What the `onOpenChange` of a `Menu.Sub` receives besides the open state: the `reason`, the `event` and `cancel()`. */
export type MenuSubChangeDetails = CancelableChangeDetails<MenuSubChangeReason>;

/** The state of a checkbox or radio item that the function form of `render` receives. */
export interface MenuCheckableItemState extends MenuItemState {
  /** Whether the item is checked. */
  readonly checked: boolean;
}

/**
 * Props of the {@link MenuCheckboxItem}. Native `div` props pass through, except `onSelect`, which this part
 * redefines.
 */
export interface MenuCheckboxItemProps extends Omit<MenuItemProps, 'render'> {
  /**
   * Whether the item is checked. Setting it makes the item controlled. If you do not update it after
   * `onCheckedChange`, the old state stays.
   *
   * @cckSemantic menu.checkboxItem.checked
   * @defaultValue false
   */
  readonly checked?: boolean | undefined;
  /**
   * The start state of an item that you do not control with `checked`. The items of a closed menu are not in the
   * document, so the state starts again at this value each time the menu opens.
   *
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultChecked?: boolean | undefined;
  /**
   * Called after the user presses the item with a click, Enter or Space. It receives the new state and a details
   * object with the `reason` and the `event`. It is never called when you change `checked` yourself.
   *
   * Enter and a click then close the menu, as for any item; Space keeps it open. Call `event.preventDefault()` in
   * `onSelect` to keep the menu open after a click or Enter.
   *
   * @example
   * <Menu.CheckboxItem checked={bold} onCheckedChange={(next) => setBold(next)}>Bold</Menu.CheckboxItem>
   * @cckSemantic menu.checkboxItem.checkedChange
   * @cckParity The change callback of this component.
   */
  readonly onCheckedChange?: ((checked: boolean, details: MenuItemChangeDetails) => void) | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<MenuRenderProps, MenuCheckableItemState> | undefined;
}

/** Props of the {@link MenuRadioGroup}. Native `div` props pass through. */
export interface MenuRadioGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'defaultValue'> {
  /**
   * The radio items of the group, and a `Menu.GroupLabel` that names it.
   *
   * @example
   * <Menu.RadioGroup value={sort} onValueChange={(next) => setSort(next)}>
   *   <Menu.RadioItem value="name">Name</Menu.RadioItem>
   *   <Menu.RadioItem value="date">Date</Menu.RadioItem>
   * </Menu.RadioGroup>
   * @cckSemantic menu.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The `value` of the checked radio item. Setting it makes the group controlled. If you do not update it after
   * `onValueChange`, the old value stays.
   *
   * @cckSemantic menu.radioGroup.value
   */
  readonly value?: string | undefined;
  /**
   * The start value of a group that you do not control with `value`. When not set, no radio item is checked. The
   * items of a closed menu are not in the document, so the value starts again here each time the menu opens.
   *
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultValue?: string | undefined;
  /**
   * Called after the user presses a radio item that is not checked. It receives the value of the item and a
   * details object with the `reason` and the `event`. It is never called when you change `value` yourself.
   *
   * @cckSemantic menu.radioGroup.valueChange
   * @cckParity The change callback of this component.
   */
  readonly onValueChange?: ((value: string, details: MenuItemChangeDetails) => void) | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<MenuRenderProps, MenuState> | undefined;
}

/** Props of the {@link MenuRadioItem}. Native `div` props pass through, except `onSelect`, which this part redefines. */
export interface MenuRadioItemProps extends Omit<MenuItemProps, 'render'> {
  /**
   * The value that the item sets in its `Menu.RadioGroup`. The item is checked while the group holds this value.
   *
   * @cckSemantic menu.radioItem.value
   */
  readonly value: string;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<MenuRenderProps, MenuCheckableItemState> | undefined;
}

/** Props of the {@link MenuGroup} and the {@link MenuGroupLabel}. Native `div` props pass through. */
export interface MenuDivProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The content of the part: the items of a group, or the text of a label.
   *
   * @cckSemantic menu.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<MenuRenderProps, MenuState> | undefined;
}

/**
 * Props of the {@link MenuItemIndicator}, the {@link MenuItemLeading}, the {@link MenuItemTrailing}, the
 * {@link MenuItemSupportingText} and the {@link MenuItemShortcut}. Native `span` props pass through.
 */
export interface MenuSpanProps extends Omit<ComponentPropsWithRef<'span'>, 'color'> {
  /**
   * The content of the part: an icon or a text.
   *
   * @cckSemantic menu.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<MenuRenderProps, MenuState> | undefined;
}

/** Props of the {@link MenuSub}. The Sub renders no element. It holds the open state of one submenu. */
export interface MenuSubProps {
  /**
   * The parts of the submenu: a `Menu.SubTrigger` and a `Menu.SubContent`. Put the Sub among the items of a
   * `Menu.Content`. The Sub renders no element around them.
   *
   * @example
   * <Menu.Sub>
   *   <Menu.SubTrigger>Share</Menu.SubTrigger>
   *   <Menu.SubContent>
   *     <Menu.Item>Email</Menu.Item>
   *   </Menu.SubContent>
   * </Menu.Sub>
   * @cckSemantic menu.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether the submenu is open. Setting it makes the open state controlled. If you do not update it after
   * `onOpenChange`, the old state stays.
   *
   * @cckSemantic menu.sub.open
   * @defaultValue false
   */
  readonly open?: boolean | undefined;
  /**
   * The start open state of a submenu that you do not control with `open`.
   *
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   * @defaultValue false
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Called before the user opens or closes the submenu. It receives the new open state and a details object with
   * the `reason`, the `event` and `cancel()`. It is never called when you change `open` yourself.
   *
   * @cckSemantic menu.sub.openChange
   * @cckParity The change callback of this component.
   */
  readonly onOpenChange?: ((open: boolean, details: MenuSubChangeDetails) => void) | undefined;
}

/**
 * Props of the {@link MenuSubTrigger}. Native `div` props pass through. It is an item of the parent menu: it opens
 * the submenu and never runs.
 */
export interface MenuSubTriggerProps extends Omit<MenuItemProps, 'onSelect'> {
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<MenuRenderProps, MenuItemState> | undefined;
}

/**
 * Props of the {@link MenuSubContent}. Native `div` props pass through. The side and the alignment are fixed: the
 * content opens at the bottom-end corner of the sub-trigger.
 */
export type MenuSubContentProps = Omit<MenuContentProps, 'side' | 'align' | 'alignOffset'>;
