import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * Renders a `<div>` by default with content outside the box, after it. It is a plain wrapper: it adds no ARIA and
 * wires nothing, and its text is not part of the control's name or description. Give an icon `aria-hidden="true"`
 * and a button its own accessible name. Pass it to the `trailing` slot of a FormField to place it; it also works
 * outside a FormField. Native attributes fall through to the root.
 *
 * @example
 * <FormField><template #trailing><Trailing>Go</Trailing></template><template #label><Label>Search</Label></template><Input /></FormField>
 *
 * @cckPart root
 */
export interface TrailingProps {
  /**
   * The tag or component to render.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the Trailing merges its attributes onto the one element or component child of its
   * default slot instead of rendering an element.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
