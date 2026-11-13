'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { createIconRegistry, type IconLoader, type IconRegistry } from '@cocokits/cdk/icon-registry';
import type { Icon } from '@cocokits/icons';

const IconRegistryContext = createContext<IconRegistry | null>(null);

/** Props of {@link IconProvider}. */
export interface IconProviderProps {
  /**
   * Icons to register now, by name. They are in the server HTML. Only the icons you import end up in your bundle.
   * In a Next.js Server Component this record can be passed as it is, because icons are plain data.
   *
   * Trusted content only: the `body` of an icon is inserted as markup, with no sanitising.
   */
  readonly icons?: Readonly<Record<string, Icon>> | undefined;
  /**
   * Icons that load on first use, by name. Each loader resolves an icon or a full `<svg>` string, and runs at most
   * once. The icon is drawn after mount, never in the server HTML. The record holds functions, so pass it from a
   * Client Component in Next.js.
   *
   * Trusted content only: what a loader resolves is inserted as markup, with no sanitising.
   */
  readonly lazyIcons?: Readonly<Record<string, IconLoader>> | undefined;
  /** The subtree that reads the icons. */
  readonly children?: ReactNode;
}

/** What a provider remembers between renders. */
interface Memory {
  icons: IconProviderProps['icons'];
  lazyIcons: IconProviderProps['lazyIcons'];
  mounted: boolean;
}

function register(registry: IconRegistry, { icons, lazyIcons }: Pick<IconProviderProps, 'icons' | 'lazyIcons'>): void {
  if (icons) registry.registerIcons(icons);
  if (lazyIcons) {
    for (const [name, load] of Object.entries(lazyIcons)) registry.registerIcon(name, load);
  }
}

/**
 * Provides the icon registry of an app or a subtree: the icons `SvgIcon` and the icon-holding parts can draw. It
 * makes one registry for each mounted tree, never a module-level one, so server renders never share icons. The four
 * base icons (`chevron-down`, `check`, `minus`, `close`) are always there. A nested provider adds to the outer one
 * and falls back to it.
 *
 * `icons` and `lazyIcons` are registered when the provider is created, so the server render has them. A later change
 * of a record registers its new entries too: names are replaced, none is removed.
 *
 * Trusted content only: icon markup is inserted as it is, with no sanitising. Never register text from users or
 * other untrusted sources.
 *
 * @example
 * import { IconProvider } from '@cocokits/react-core';
 * import { cocokitsThemeIcons } from '@cocokits/theme-cocokits';
 *
 * <IconProvider icons={cocokitsThemeIcons}>
 *   <App />
 * </IconProvider>
 * @param props - The IconProvider props.
 * @returns The subtree inside the registry context.
 */
export function IconProvider({ icons, lazyIcons, children }: IconProviderProps): ReactElement {
  const parent = useContext(IconRegistryContext);
  const [registry] = useState<IconRegistry>(() => {
    const created = createIconRegistry(parent ?? undefined);
    register(created, { icons, lazyIcons });
    return created;
  });
  const memory = useRef<Memory>({ icons, lazyIcons, mounted: false });

  useEffect(() => {
    const remembered = memory.current;
    remembered.mounted = true;
    // The records changed after the first render: register what they hold now.
    if (remembered.icons !== icons || remembered.lazyIcons !== lazyIcons) {
      register(registry, {
        icons: remembered.icons === icons ? undefined : icons,
        lazyIcons: remembered.lazyIcons === lazyIcons ? undefined : lazyIcons,
      });
      remembered.icons = icons;
      remembered.lazyIcons = lazyIcons;
    }
  }, [registry, icons, lazyIcons]);

  useEffect(() => {
    const remembered = memory.current;
    return () => {
      remembered.mounted = false;
      // StrictMode runs the cleanup and the effect again at once; only a scope that stays unmounted ends.
      queueMicrotask(() => {
        if (!remembered.mounted) registry.destroy();
      });
    };
  }, [registry]);

  return <IconRegistryContext value={registry}>{children}</IconRegistryContext>;
}

/** The registry used without a provider: the base icons only. It cannot be written, so no request can leak into it. */
let baseRegistry: IconRegistry | undefined;

function readOnlyBaseRegistry(): IconRegistry {
  if (baseRegistry) return baseRegistry;
  const base = createIconRegistry();
  const refuse = (): void => {
    console.error(
      'CocoKits: there is no IconProvider above, so icons cannot be registered. Wrap your app in IconProvider.',
    );
  };
  baseRegistry = {
    registerIcons: refuse,
    registerIcon: refuse,
    has: (name) => base.has(name),
    get: (name) => base.get(name),
    load: (name) => base.load(name),
    subscribe: (listener) => base.subscribe(listener),
    destroy: () => undefined,
  };
  return baseRegistry;
}

/**
 * Reads the icon registry of the nearest {@link IconProvider}, to register icons later with `registerIcons` or
 * `registerIcon`.
 *
 * Without a provider it returns a read-only registry of the four base icons: a register call logs a `CocoKits:`
 * error and does nothing.
 *
 * Trusted content only: registered markup is inserted as it is, with no sanitising.
 *
 * @example
 * const registry = useIconRegistry();
 * registry.registerIcons({ logo: logoIcon });
 * @returns The nearest registry.
 */
export function useIconRegistry(): IconRegistry {
  const registry = useContext(IconRegistryContext);
  return registry ?? readOnlyBaseRegistry();
}
