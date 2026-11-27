import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * Content inside the box, after the control: a unit, an icon or a button. It renders a `<div>` and adds no ARIA. Its
 * text is not part of the name or the description of the control.
 *
 * An SVG icon is hidden from screen readers by default; give your own `<svg>` `aria-hidden="true"`. Give a button its own accessible name. Put it in the `suffix` slot of a
 * FormField to place it. It also works outside a FormField. Native attributes fall through to the root.
 *
 * @example
 * <FormField>
 *   <template #label><Label>Weight</Label></template>
 *   <template #suffix><Suffix>kg</Suffix></template>
 *   <Input />
 * </FormField>
 *
 * @cckPart root
 */
export interface SuffixProps {
  /**
   * The tag or component to render. It is ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the Suffix merges its attributes onto the one element or component child of its default slot,
   * instead of rendering an element.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
