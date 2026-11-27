import { dividerAnatomy } from './divider.anatomy';
import type { DividerParts, DividerProps } from './divider.types';

/**
 * Computes the props of a Divider. Pure.
 *
 * @param input - The orientation (default `horizontal`) and whether the line is decorative (default `false`).
 * @returns The root props: a decorative line gets `role="none"`, a vertical one `aria-orientation="vertical"`.
 */
export function getDividerProps({ orientation = 'horizontal', decorative = false }: DividerProps = {}): DividerParts {
  return {
    root: {
      class: dividerAnatomy.classes.root,
      'data-orientation': orientation,
      ...(decorative
        ? { role: 'none' as const }
        : orientation === 'vertical'
          ? { 'aria-orientation': 'vertical' as const }
          : {}),
    },
  };
}
