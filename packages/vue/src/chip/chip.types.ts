import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * A chip: one short value, such as a tag or a filter, with an optional button that removes it. It renders a
 * `<div>`, and the content you write is the text of the chip. With `removable`, a native button follows the text.
 *
 * @remarks The chip never removes itself: the button emits `remove`, and your code takes the chip away.
 *
 * The button is named by the text of the chip, so a screen reader says the text and "button". When you need a longer
 * name such as "Remove Pizza", put the extra words in the content, hidden visually.
 *
 * The icon of the button is the icon the theme names for the part `remove`, else `close`. When your code removes a
 * standalone chip, move the focus yourself, for example to the next chip or to the control that added it.
 *
 * @example
 * <Chip removable @remove="remove('Pizza')">Pizza</Chip>
 *
 * @cckPart root
 * @cckPart contentWrapper
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
   * Whether the chip is disabled. The root gets `data-disabled`, and the remove button is natively disabled and
   * emits nothing.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
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
   * Emits once when the user activates the remove button, with a click or with Enter or Space. It has no payload.
   * A disabled chip emits nothing.
   *
   * @remarks Remove the chip in your handler; the chip does not remove itself.
   *
   * @cckSemantic chip.remove
   * @cckParity The `remove` event of the remove button; it carries nothing.
   */
  remove: [];
}
