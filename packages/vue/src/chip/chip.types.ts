import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * A chip: one short value, such as a tag or a filter, with an optional button that removes it. It renders a
 * `<div>`, and the content you write is the text of the chip. With `removable`, a native button follows the text.
 *
 * Set `selected` (or `defaultSelected`) to make the chip selectable. The content is then a toggle `<button>` with
 * `aria-pressed` and `data-selected`. A check part shows while the chip is selected, with the theme icon of the part
 * `check`, else `check`. The label of the toggle never changes. The remove button is a sibling of the toggle.
 *
 * @remarks The chip never removes itself: the button emits `remove`, and your code takes the chip away.
 *
 * The button is named "Remove" and the text of the chip, for example "Remove Pizza". `removeLabel` replaces the whole
 * name. A disabled chip renders no remove button.
 *
 * The icon of the button is the icon the theme names for the part `remove`, else `close`. When your code removes a
 * standalone chip, move the focus yourself, for example to the next chip or to the control that added it.
 *
 * @example
 * <Chip removable @remove="remove('Pizza')">Pizza</Chip>
 *
 * @cckPart root
 * @cckPart contentWrapper
 * @cckPart check
 * @cckPart remove
 */
export interface ChipProps {
  /**
   * The `id` of the chip. When not set, the chip generates one that is the same on the server and in the browser.
   * The text wrapper has the id `<id>-content`.
   */
  readonly id?: string | undefined;
  /**
   * Whether the chip shows the remove button.
   *
   * @defaultValue false
   */
  readonly removable?: boolean | undefined;
  /**
   * Whether the chip is disabled. It renders no remove button, and the toggle of a selectable chip is natively
   * disabled.
   *
   * @remarks The root gets `data-disabled`.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the chip is selected, bound with `v-model:selected`. Setting it to `true` or `false` makes the chip
   * selectable; while it is not set, the chip has no toggle and no check. When not set, the chip keeps its own state,
   * which starts as `defaultSelected`.
   *
   * If you listen for changes and do not accept one, the old value stays.
   *
   * @cckSemantic chip.selected
   * @cckParity Bound with `v-model:selected`.
   */
  readonly selected?: boolean | undefined;
  /**
   * The modifiers of `v-model:selected`. The framework fills it. The component declares it so the modifiers do not
   * reach the DOM.
   *
   * @internal
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly selectedModifiers?: Record<string, true> | undefined;
  /**
   * The start selected state of a chip whose `v-model:selected` is not bound. Setting it makes the chip selectable.
   * When not set, the chip is not selectable until `selected` is.
   *
   * @remarks It is read once, when the chip is created.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   */
  readonly defaultSelected?: boolean | undefined;
  /**
   * The accessible name of the remove button, in place of "Remove" and the text of the chip. An empty string counts
   * as not set.
   *
   * @cckSemantic chip.removeLabel
   * @defaultValue "Remove <chip text>"
   */
  readonly removeLabel?: string | undefined;
  /**
   * The tag or component to render as the root. The remove button is always a native `<button>`. It is ignored with
   * `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`. The remove button is always a native `<button>`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the root merges onto the one child of the default slot. The children of the child become the text of
   * the chip.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/** The events of the Chip. */
export interface ChipEmits {
  /**
   * Emits the new selected state for `v-model:selected` when the user presses the toggle of a selectable chip, with a
   * click, Enter or Space. It never fires when your code sets `selected`.
   *
   * @example
   * <Chip :selected="vegan" aria-label="Vegan" @update:selected="(next) => (vegan = next)">Vegan</Chip>
   *
   * @cckSemantic chip.selectedChange
   * @cckParity The `update:selected` event is the only change event; it carries the value only.
   */
  'update:selected': [selected: boolean];
  /**
   * Emits once when the user activates the remove button, with a click or with Enter or Space. It has no payload.
   * A disabled chip renders no remove button, so it emits nothing.
   *
   * @remarks Remove the chip in your handler; the chip does not remove itself.
   *
   * @cckSemantic chip.remove
   * @cckParity The `remove` event of the remove button; it carries nothing.
   */
  remove: [];
}
