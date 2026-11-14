import type { ReactNode } from 'react';

/**
 * Whether the author gave a part content: anything but `undefined`, `null`, `false`, `true`, `''` or an array of
 * only these. An element, a component or any other text is content.
 *
 * @param children - The `children` of the part.
 * @returns `true` when the content replaces the part's icon.
 */
export function hasContent(children: ReactNode): boolean {
  if (Array.isArray(children)) return children.some((child: ReactNode) => hasContent(child));
  return !(children === undefined || children === null || typeof children === 'boolean' || children === '');
}
