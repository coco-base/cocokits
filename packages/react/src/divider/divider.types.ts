import type { ComponentPropsWithRef } from 'react';
import type { DividerOrientation as MachineDividerOrientation } from '@cocokits/machines/divider';

/**
 * The direction of the line.
 *
 * @cckValue horizontal - A line across the container, between stacked blocks.
 * @cckValue vertical - A line down the container, between the items of a row.
 */
export type DividerOrientation = MachineDividerOrientation;

/**
 * Props of the {@link Divider}. Native `hr` props pass through, and `ref` reaches the element. The element is
 * always an `<hr>` with no content, so there is no `render` and no `children`.
 */
export interface DividerProps extends Omit<ComponentPropsWithRef<'hr'>, 'color' | 'children'> {
  /**
   * The direction of the line. A vertical line also sets `aria-orientation="vertical"`, because the implicit value is
   * `horizontal`.
   *
   * @defaultValue 'horizontal'
   */
  readonly orientation?: DividerOrientation | undefined;
  /**
   * Whether the line is only visual. It sets `role="none"`, so the line leaves the accessibility tree.
   *
   * @remarks Use it where the line repeats a grouping that headings, lists or landmarks already give. Set `decorative`
   * and do not write a `role` of your own.
   *
   * @defaultValue false
   */
  readonly decorative?: boolean | undefined;
}
