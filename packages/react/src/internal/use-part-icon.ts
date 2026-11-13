'use client';

import { useCallback, useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { defaultPartIcons } from '@cocokits/icons';
import { useIconRegistry, useThemeConfig } from '@cocokits/react-core';
import { isDevelopment } from './dev';
import { hasContent } from './has-content';

const defaults: Readonly<Record<string, Readonly<Record<string, string>> | undefined>> = defaultPartIcons;

/**
 * The name of the icon an icon-holding part draws, when the author gave the part no content and `visible`. The
 * first that exists wins: the icon the theme names for the part in `components.<block>.icons`, when the registry has
 * it, else the default of `defaultPartIcons`. A theme name the registry lacks falls back to the default and, in
 * development, logs one `CocoKits:` error after mount. The part renders `<SvgIcon iconName>` itself; a late
 * registration re-renders it, and the server and the first client render give the same result.
 *
 * @param anatomy - The anatomy of the component; its block names the component in the theme and in the defaults.
 * @param part - The part that holds the icon.
 * @param children - The `children` the author gave the part, if the part takes content.
 * @param visible - Whether the state of the part shows the icon. Default `true`.
 * @returns The icon name, or `undefined` when the part keeps its `children` as they are or shows no icon.
 */
export function usePartIcon<A extends { readonly block: string; readonly parts: object }>(
  anatomy: A,
  part: keyof A['parts'] & string,
  children?: ReactNode,
  visible = true,
): string | undefined {
  const registry = useIconRegistry();
  const themed = useThemeConfig()?.components[anatomy.block]?.icons?.[part];
  const subscribe = useCallback((listener: () => void) => registry.subscribe(listener), [registry]);
  const available = useSyncExternalStore(
    subscribe,
    () => themed !== undefined && registry.has(themed),
    () => themed !== undefined && registry.has(themed),
  );
  const own = hasContent(children);
  const shown = !own && visible;

  const reported = useRef<string | null>(null);
  useEffect(() => {
    if (!shown || themed === undefined || available) {
      reported.current = null;
    } else if (reported.current !== themed && isDevelopment()) {
      reported.current = themed;
      console.error(
        `CocoKits: the theme names the icon "${themed}" for ${anatomy.block} ${part}, but no icon with that name is registered. The default icon is shown. Register it with registerIcons or registerIcon.`,
      );
    }
  }, [shown, themed, available, anatomy.block, part]);

  if (!shown) return undefined;
  return available ? themed : defaults[anatomy.block]?.[part];
}
