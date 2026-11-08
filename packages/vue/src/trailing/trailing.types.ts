import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * Content outside the box, after it. It renders a `<div>` and adds no ARIA. Its text is not part of the name or the
 * description of the control.
 *
 * Give an icon `aria-hidden="true"`, and give a button its own accessible name. Put it in the `trailing` slot of a
 * FormField to place it. It also works outside a FormField. Native attributes fall through to the root.
 *
 * @example
 * <FormField>
 *   <template #label><Label>Search</Label></template>
 *   <template #trailing><Trailing>Go</Trailing></template>
 *   <Input />
 * </FormField>
 *
 * @cckPart root
 */
export interface TrailingProps {
  /**
   * The tag or component to render. It is ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the Trailing merges its attributes onto the one element or component child of its default slot,
   * instead of rendering an element.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
