import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * One item of the menu that is a checkbox. It renders a `<div>` with `role="menuitemcheckbox"` and `aria-checked`. Bind the state with `v-model`.
 *
 * Use it instead of a `Checkbox` or a `Radio` inside a menu. It gives the roles a screen reader expects in a menu.
 * It keeps the focus in the menu and follows the menu keys. It runs a press once, where a native checkbox or radio
 * inside an item would act twice on one click.
 *
 * A click, Enter or Space toggles it. Enter and a click close the menu, after `select`. Space keeps the menu open. A
 * disabled item stays focusable and changes nothing.
 *
 * @example
 * <MenuCheckboxItem v-model="showGrid">Show grid</MenuCheckboxItem>
 *
 * @cckPart checkboxItem
 */
export interface MenuCheckboxItemProps {
  /**
   * Whether the item is checked, bound with `v-model`. When not set, the item keeps its own state, which starts as
   * `defaultChecked`.
   *
   * If you listen for changes and do not accept one, the old value stays.
   *
   * @cckSemantic menu.checkboxItem.checked
   * @cckParity Bound with `v-model`.
   * @defaultValue false
   */
  readonly modelValue?: boolean | undefined;
  /**
   * The modifiers of `v-model`. The framework fills it. The component declares it so the modifiers do not reach the
   * DOM.
   *
   * @internal
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly modelModifiers?: Record<string, true> | undefined;
  /**
   * The start state of an item whose `v-model` is not bound. It is read once, when the item is created.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   * @defaultValue false
   */
  readonly defaultChecked?: boolean | undefined;
  /**
   * Whether the item is disabled. A disabled item stays in the menu and keeps focus, and changes nothing.
   *
   * @cckSemantic menu.item.disabled
   * @cckParity The same name in every framework.
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/** The events of the MenuCheckboxItem. */
export interface MenuCheckboxItemEmits {
  /**
   * Emits the new checked state for `v-model` when the user presses the item. It never fires when your code sets the
   * state.
   *
   * @cckSemantic menu.checkboxItem.checkedChange
   * @cckParity The `update:modelValue` event is the only change event; it carries the value only.
   */
  'update:modelValue': [checked: boolean];
  /**
   * Emits when the item is pressed, with a cancelable event that is not the click. Call `preventDefault()` to keep the
   * menu open.
   *
   * @remarks The state still changes. A disabled item emits nothing.
   *
   * @example
   * <MenuCheckboxItem v-model="showGrid" @select="(event) => event.preventDefault()">Show grid</MenuCheckboxItem>
   *
   * @cckSemantic menu.item.activate
   * @cckParity The Item part emits it.
   */
  select: [event: Event];
}

/**
 * The group of the radio items of the menu. It renders a `<div>` with `role="group"`, named by a `MenuGroupLabel` inside it when there is one. Bind the value with `v-model`: it is the `value` of the checked `MenuRadioItem`.
 *
 * @example
 * <MenuRadioGroup v-model="sort">
 *   <MenuGroupLabel>Sort by</MenuGroupLabel>
 *   <MenuRadioItem value="name">Name</MenuRadioItem>
 *   <MenuRadioItem value="date">Date</MenuRadioItem>
 * </MenuRadioGroup>
 *
 * @cckPart radioGroup
 */
export interface MenuRadioGroupProps {
  /**
   * The value of the checked radio item, bound with `v-model`. `null` checks none. When not set, the group keeps its
   * own value, which starts as `defaultValue`.
   *
   * If you listen for changes and do not accept one, the old value stays.
   *
   * @cckSemantic menu.radioGroup.value
   * @cckParity Bound with `v-model`.
   * @defaultValue null
   */
  readonly modelValue?: string | null | undefined;
  /**
   * The modifiers of `v-model`. The framework fills it. The component declares it so the modifiers do not reach the
   * DOM.
   *
   * @internal
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly modelModifiers?: Record<string, true> | undefined;
  /**
   * The start value of a group whose `v-model` is not bound. It is read once, when the group is created. When not set,
   * no radio item starts checked.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   */
  readonly defaultValue?: string | undefined;
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/** The events of the MenuRadioGroup. */
export interface MenuRadioGroupEmits {
  /**
   * Emits the new value for `v-model` when the user presses a radio item. It never fires when your code sets the value.
   *
   * @cckSemantic menu.radioGroup.valueChange
   * @cckParity The `update:modelValue` event is the only change event; it carries the value only.
   */
  'update:modelValue': [value: string];
}

/**
 * One item of a `MenuRadioGroup`. It renders a `<div>` with `role="menuitemradio"` and `aria-checked`. It is checked while its `value` is the value of the group.
 *
 * Use it instead of a `Checkbox` or a `Radio` inside a menu. It gives the roles a screen reader expects in a menu.
 * It keeps the focus in the menu and follows the menu keys. It runs a press once, where a native checkbox or radio
 * inside an item would act twice on one click.
 *
 * A click or Enter checks it and closes the menu, after `select`. Space checks it and keeps the menu open.
 *
 * @example
 * <MenuRadioItem value="name">Name</MenuRadioItem>
 *
 * @cckPart radioItem
 */
export interface MenuRadioItemProps {
  /**
   * The value the item gives its group when it is pressed.
   *
   * @cckSemantic menu.radioItem.value
   * @cckParity The same name in every framework.
   */
  readonly value: string;
  /**
   * Whether the item is disabled. A disabled item stays in the menu and keeps focus, and changes nothing.
   *
   * @cckSemantic menu.item.disabled
   * @cckParity The same name in every framework.
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/** The events of the MenuRadioItem. */
export interface MenuRadioItemEmits {
  /**
   * Emits when the item is pressed, with a cancelable event that is not the click. Call `preventDefault()` to keep the
   * menu open.
   *
   * @remarks The value still changes. A disabled item emits nothing.
   *
   * @example
   * <MenuRadioItem value="name" @select="(event) => event.preventDefault()">Name</MenuRadioItem>
   *
   * @cckSemantic menu.item.activate
   * @cckParity The Item part emits it.
   */
  select: [event: Event];
}

/**
 * The mark of a checkbox or radio item, written inside it. It renders a `<span>` that assistive technology does not
 * see, with `data-state` `checked` or `unchecked`. It is always rendered: the theme shows it while the item is checked.
 *
 * @cckPart itemIndicator
 */
export interface MenuItemIndicatorProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * A set of related items. It renders a `<div>` with `role="group"`, named by a `MenuGroupLabel` inside it when there
 * is one.
 *
 * @cckPart group
 */
export interface MenuGroupProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The name of a `MenuGroup` or `MenuRadioGroup`. It renders a `<div>` and names the group through `aria-labelledby`.
 *
 * @cckPart groupLabel
 */
export interface MenuGroupLabelProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * What comes before the text of an item, such as an icon. It renders a `<span>` that assistive technology does not
 * see, so the text names the item. An item with only an icon needs `aria-label`.
 *
 * @cckPart itemLeading
 */
export interface MenuItemLeadingProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * What comes after the text of an item, such as an icon. It renders a `<span>` that assistive technology does not
 * see.
 *
 * @cckPart itemTrailing
 */
export interface MenuItemTrailingProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * A smaller text under the text of an item. It renders a `<span>` and is the `aria-describedby` of the item.
 *
 * @cckPart itemSupportingText
 */
export interface MenuItemSupportingTextProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The keyboard shortcut of an item, as text. It renders a `<span>`.
 *
 * @cckPart itemShortcut
 */
export interface MenuItemShortcutProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
