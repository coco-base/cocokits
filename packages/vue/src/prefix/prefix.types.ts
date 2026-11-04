import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * Renders a `<div>` by default with content inside the box, before the control: an icon, a currency sign or a short
 * text. It is a plain wrapper: it adds no ARIA and wires nothing, and its text is not part of the control's name or
 * description. Give an icon `aria-hidden="true"` and a button its own accessible name. Pass it to the `prefix` slot
 * of a FormField to place it; it also works outside a FormField. Native attributes fall through to the root.
 *
 * @example
 * <FormField><template #prefix><Prefix>$</Prefix></template><template #label><Label>Price</Label></template><Input /></FormField>
 *
 * @cckPart root
 */
export interface PrefixProps {
  /**
   * The tag or component to render.
   *
   * @cckSemantic none
   * @remarks Vue's element override (Reka).
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the Prefix merges its attributes onto the one element or component child of its
   * default slot instead of rendering an element.
   *
   * @cckSemantic none
   * @remarks Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
