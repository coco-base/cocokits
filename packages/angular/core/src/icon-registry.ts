import {
  DestroyRef,
  Injectable,
  afterRenderEffect,
  computed,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  signal,
  type EnvironmentProviders,
  type Signal,
} from '@angular/core';
import { createIconRegistry, type IconLoader, type IconRegistry } from '@cocokits/cdk/icon-registry';
import { defaultPartIcons, type Icon } from '@cocokits/icons';
import { CCK_THEME } from './theme-provider';

/**
 * The icons of one application: the four base icons (`chevron-down`, `check`, `minus`, `close`) and every icon
 * you register. There is one registry per application, so a server render never shares icons with another.
 *
 * Register icons at start with `provideCckIcons`, or later with the methods below. Only the icons you import are
 * in your bundle.
 *
 * Trusted content only: the markup of an icon is inserted as it is, with no sanitising. Never register markup from
 * users or other untrusted sources.
 *
 * @example
 * import { checkIcon } from '@cocokits/icons';
 *
 * inject(CckIconRegistry).registerIcons({ check: checkIcon });
 */
@Injectable({ providedIn: 'root' })
export class CckIconRegistry implements IconRegistry {
  private readonly registry = createIconRegistry();
  private readonly version = signal(0);

  /**
   * Changes whenever an icon is registered or a lazy icon has loaded. Read it inside a `computed` or an effect to
   * draw a late icon.
   */
  readonly changes: Signal<number> = this.version.asReadonly();

  constructor() {
    const stop = this.registry.subscribe(() => {
      this.version.update((version) => version + 1);
    });
    inject(DestroyRef).onDestroy(() => {
      stop();
      this.registry.destroy();
    });
  }

  /**
   * Registers icons by name, now. A name that is registered again is replaced.
   *
   * Trusted content only: the `body` of an icon is inserted as markup, with no sanitising.
   *
   * @param icons - The icons, keyed by name.
   * @example
   * inject(CckIconRegistry).registerIcons({ check: checkIcon });
   */
  registerIcons(icons: Readonly<Record<string, Icon>>): void {
    this.registry.registerIcons(icons);
  }

  /**
   * Registers one icon that loads on first use. A name that is registered again is replaced and its loaded result
   * is dropped.
   *
   * Trusted content only: what the loader resolves is inserted as markup, with no sanitising.
   *
   * @param name - The icon name.
   * @param load - Fetches or imports the icon; it resolves an icon or a full `<svg>` string.
   * @example
   * inject(CckIconRegistry).registerIcon('logo', () => import('./logo-icon').then((module) => module.logoIcon));
   */
  registerIcon(name: string, load: IconLoader): void {
    this.registry.registerIcon(name, load);
  }

  /**
   * Whether the name is registered, eagerly or lazily.
   *
   * @param name - The icon name.
   * @returns `true` when the name is registered.
   */
  has(name: string): boolean {
    return this.registry.has(name);
  }

  /**
   * Reads an icon that is registered eagerly or already loaded. It never starts a load.
   *
   * @param name - The icon name.
   * @returns The icon, or `undefined` when it is not available yet.
   */
  get(name: string): Icon | undefined {
    return this.registry.get(name);
  }

  /**
   * Gets an icon, loading it when it is registered lazily. Call it in the browser only.
   *
   * @param name - The icon name.
   * @returns The icon, or `undefined` when the name is unknown or the load failed.
   */
  load(name: string): Promise<Icon | undefined> {
    return this.registry.load(name);
  }

  /**
   * Calls `listener` after an icon is registered and after a lazy icon has loaded.
   *
   * @param listener - Called with no arguments.
   * @returns A function that stops the listener.
   */
  subscribe(listener: () => void): () => void {
    return this.registry.subscribe(listener);
  }

  /** Drops the listeners and the loaded icons. The application calls it when it is destroyed. */
  destroy(): void {
    this.registry.destroy();
  }
}

/** The icons to register when the application starts. */
export interface CckIconsOptions {
  /** Icons by name, registered now. They are in the server HTML. */
  readonly icons?: Readonly<Record<string, Icon>>;
  /** Icons by name that load on first use; each loader resolves an icon or a full `<svg>` string. */
  readonly lazyIcons?: Readonly<Record<string, IconLoader>>;
}

/**
 * Registers icons when the application starts, before the first render, so a server render has them.
 *
 * Trusted content only: the markup of an icon is inserted as it is, with no sanitising.
 *
 * @param options - The eager `icons` and the `lazyIcons`.
 * @returns Environment providers for the app config.
 * @example
 * import { cocokitsThemeIcons } from '@cocokits/theme-cocokits';
 * import { searchIcon } from '@cocokits/icons';
 *
 * // In the app config:
 * providers: [
 *   provideCckIcons({
 *     icons: { ...cocokitsThemeIcons, search: searchIcon },
 *     lazyIcons: { logo: () => import('./logo-icon').then((module) => module.logoIcon) },
 *   }),
 * ]
 */
export function provideCckIcons(options: CckIconsOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const registry = inject(CckIconRegistry);
      if (options.icons) registry.registerIcons(options.icons);
      for (const [name, load] of Object.entries(options.lazyIcons ?? {})) registry.registerIcon(name, load);
    }),
  ]);
}

/**
 * The icon name an icon-holding part draws when the author gave no content of their own: the icon the theme names in
 * `components.<block>.icons.<part>` when the registry has it, else the default from `@cocokits/icons`. Call it once,
 * in an injection context. In development it logs one error after render when the theme names an icon that is not
 * registered.
 *
 * @param block - The anatomy block of the part, for example `selectAnatomy.block`.
 * @param part - The part name, for example `'dropdownIcon'`.
 * @returns A signal of the icon name; it updates when an icon is registered later.
 */
export function injectPartIconName<B extends keyof typeof defaultPartIcons>(
  block: B,
  part: keyof (typeof defaultPartIcons)[B] & string,
): Signal<string> {
  const registry = inject(CckIconRegistry);
  const named = inject(CCK_THEME, { optional: true })?.themeConfig.components[block]?.icons?.[part];
  const fallback = (defaultPartIcons[block] as Readonly<Record<string, string>>)[part] ?? '';
  const unregistered = computed(() => {
    registry.changes();
    return named !== undefined && !registry.has(named);
  });
  afterRenderEffect(() => {
    if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
    if (named !== undefined && unregistered()) {
      console.error(
        `CocoKits: the theme names the icon "${named}" for ${block}.${part}, but no icon with that name is registered. Register it with provideCckIcons or registerIcons. The default icon is drawn.`,
      );
    }
  });
  return computed(() => (named !== undefined && !unregistered() ? named : fallback));
}
