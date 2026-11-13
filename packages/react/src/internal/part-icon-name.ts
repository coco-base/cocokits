'use client';

import type { ReactNode } from 'react';
import { useThemeIcons } from '@cocokits/react-core';
import { resolvePartIconName } from '@cocokits/shared';

/**
 * Whether the author gave a part content: anything but `undefined`, `null`, `false`, `true`, `''` or an array of
 * only these. An element, a component or any other text is content.
 *
 * @param children - The `children` of the part.
 * @returns `true` when the content replaces the theme's icon.
 */
export function hasContent(children: ReactNode): boolean {
  if (Array.isArray(children)) return children.some((child: ReactNode) => hasContent(child));
  return !(children === undefined || children === null || typeof children === 'boolean' || children === '');
}

/**
 * The name of the icon an icon-holding part draws: the icon the theme names for the part, when the author gave the
 * part no content and `visible`. The part renders `<SvgIcon iconName>` itself; the server and the first client
 * render give the same result.
 *
 * @param anatomy - The anatomy of the component; its block names the component in `partIconNames`.
 * @param part - The part that holds the icon.
 * @param children - The `children` the author gave the part, if the part takes content.
 * @param visible - Whether the state of the part shows the icon. Default `true`.
 * @returns The icon name, or `undefined` when the part keeps its `children` as they are.
 */
export function usePartIconName<A extends { readonly block: string; readonly parts: object }>(
  anatomy: A,
  part: keyof A['parts'] & string,
  children?: ReactNode,
  visible = true,
): string | undefined {
  const { partIconNames } = useThemeIcons();
  if (hasContent(children) || !visible) return undefined;
  return resolvePartIconName(partIconNames, anatomy.block, part);
}
