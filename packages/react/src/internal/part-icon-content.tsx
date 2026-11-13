'use client';

import type { ReactNode } from 'react';
import { useThemeIcons } from '@cocokits/react-core';
import { SvgIcon } from '../svg-icon';

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
 * The content of an icon-holding part: the author's `children` when they are content, otherwise the SvgIcon of the
 * icon the theme names for the part when `visible`, otherwise the `children` as they are. The server and the first
 * client render give the same result.
 *
 * @param anatomy - The anatomy of the component; its block names the component in `partIconNames`.
 * @param part - The part that holds the icon.
 * @param children - The `children` the author gave the part, if the part takes content.
 * @param visible - Whether the state of the part shows the icon. Default `true`.
 * @returns What the part renders inside itself.
 */
export function usePartIconContent<A extends { readonly block: string; readonly parts: object }>(
  anatomy: A,
  part: keyof A['parts'] & string,
  children?: ReactNode,
  visible = true,
): ReactNode {
  const { partIconNames } = useThemeIcons();
  // A theme names icons for some components and parts only, so every lookup may miss.
  const names: Readonly<Record<string, Readonly<Record<string, string | undefined>> | undefined>> = partIconNames;
  const iconName = names[anatomy.block]?.[part];
  if (hasContent(children) || !visible || iconName === undefined) return children;
  return <SvgIcon iconName={iconName} />;
}
