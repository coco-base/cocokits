import { inject, type InjectionKey } from 'vue';
import {
  createIconRegistry,
  createReadOnlyIconRegistry,
  type IconLoader,
  type IconRegistry,
} from '@cocokits/cdk/icon-registry';
import type { Icon } from '@cocokits/icons';

/**
 * Props of the `IconProvider` component. It provides the icon registry of an app or a subtree: the icons `SvgIcon`
 * and the icon-holding parts can draw. It makes one registry for each provider instance, never a module-level one,
 * so server renders never share icons. The four base icons (`chevron-down`, `check`, `minus`, `close`) are always
 * there. A nested provider adds to the outer one and falls back to it.
 *
 * `icons` and `lazyIcons` are registered when the provider is created, so the server render has them. A later
 * change of a record registers its new entries too: names are replaced, none is removed.
 *
 * Trusted content only: icon markup is inserted as it is, with no sanitising. Never register text from users or
 * other untrusted sources.
 *
 * @example
 * <script setup lang="ts">
 * import { IconProvider } from '@cocokits/vue-core';
 * import { cocokitsThemeIcons } from '@cocokits/theme-cocokits';
 * </script>
 *
 * <template>
 *   <IconProvider :icons="cocokitsThemeIcons"><App /></IconProvider>
 * </template>
 */
export interface IconProviderProps {
  /**
   * Icons to register now, by name. They are in the server HTML. Only the icons you import end up in your bundle.
   *
   * Trusted content only: the `body` of an icon is inserted as markup, with no sanitising.
   */
  readonly icons?: Readonly<Record<string, Icon>> | undefined;
  /**
   * Icons that load on first use, by name. Each loader resolves an icon or a full `<svg>` string, and runs at most
   * once. The icon is drawn after mount, never in the server HTML.
   *
   * Trusted content only: what a loader resolves is inserted as markup, with no sanitising.
   */
  readonly lazyIcons?: Readonly<Record<string, IconLoader>> | undefined;
}

/** The registry the nearest `IconProvider` made. @internal */
export const ICON_REGISTRY_KEY: InjectionKey<IconRegistry> = Symbol('cck-icon-registry');

/** The registry used without a provider: the base icons only. It cannot be written, so no request can leak into it. */
let baseRegistry: IconRegistry | undefined;

function readOnlyBaseRegistry(): IconRegistry {
  baseRegistry ??= createReadOnlyIconRegistry(createIconRegistry(), () => {
    console.error(
      'CocoKits: there is no IconProvider above, so icons cannot be registered. Wrap your app in IconProvider.',
    );
  });
  return baseRegistry;
}

/**
 * Reads the icon registry of the nearest `IconProvider`, to register icons later with `registerIcons` or
 * `registerIcon`. Call it in `setup`.
 *
 * Without a provider it returns a read-only registry of the four base icons (`chevron-down`, `check`, `minus`,
 * `close`): a register call logs a `CocoKits:` error and does nothing.
 *
 * Trusted content only: registered markup is inserted as it is, with no sanitising.
 *
 * @example
 * import { useIconRegistry } from '@cocokits/vue-core';
 * import { searchIcon } from '@cocokits/icons';
 *
 * useIconRegistry().registerIcons({ search: searchIcon });
 * @returns The nearest registry.
 */
export function useIconRegistry(): IconRegistry {
  return inject(ICON_REGISTRY_KEY, undefined) ?? readOnlyBaseRegistry();
}
