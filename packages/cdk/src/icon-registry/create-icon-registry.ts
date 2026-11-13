import { baseIcons, type Icon } from '@cocokits/icons';
import { isDevelopment } from './dev';
import { parseSvg } from './parse-svg';

/**
 * Loads one icon on demand. It resolves an {@link Icon} or a full `<svg>` string. It does the `fetch` or the
 * `import()` itself; the registry has no built-in URL fetch.
 */
export type IconLoader = () => Promise<Icon | string>;

/** The icons of one app: eager and lazy icons by name, with a change signal. */
export interface IconRegistry {
  /**
   * Registers icons by name, now. A name that is registered again is replaced. Only the icons you import end up in
   * your bundle.
   *
   * Trusted content only: the `body` of an icon is inserted as markup, with no sanitising.
   *
   * @param icons - The icons, keyed by name.
   * @example
   * registry.registerIcons({ 'chevron-down': chevronDownIcon });
   */
  registerIcons(icons: Readonly<Record<string, Icon>>): void;
  /**
   * Registers one icon that loads on first use. A name that is registered again is replaced and its loaded result
   * is dropped.
   *
   * Trusted content only: what the loader resolves is inserted as markup, with no sanitising.
   *
   * @param name - The icon name.
   * @param load - Fetches or imports the icon; it resolves an icon or a full `<svg>` string.
   * @example
   * registry.registerIcon('logo', () => import('./logo-icon').then((module) => module.logoIcon));
   */
  registerIcon(name: string, load: IconLoader): void;
  /**
   * Whether the name is registered, eagerly or lazily, here or in the parent registry.
   *
   * @param name - The icon name.
   * @returns `true` when the name is registered.
   */
  has(name: string): boolean;
  /**
   * Reads an icon that is registered eagerly or already loaded. It never starts a load.
   *
   * @param name - The icon name.
   * @returns The icon, or `undefined` when it is not available yet.
   */
  get(name: string): Icon | undefined;
  /**
   * Gets an icon, loading it when it is registered lazily. Call it in the browser only.
   *
   * The loader runs at most once per name; callers that arrive during a load share it, and the result is kept in
   * memory. A failed load is not tried again until the name is registered again.
   *
   * @param name - The icon name.
   * @returns The icon, or `undefined` when the name is unknown or the load failed.
   */
  load(name: string): Promise<Icon | undefined>;
  /**
   * Calls `listener` after an icon is registered and after a lazy icon has loaded.
   *
   * @param listener - Called with no arguments.
   * @returns A function that stops the listener.
   */
  subscribe(listener: () => void): () => void;
  /** Drops the listeners and the loaded icons. After this, loads that are still running store nothing. */
  destroy(): void;
}

interface Load {
  readonly promise: Promise<Icon | undefined>;
}

function logLoadError(name: string, reason: string): void {
  if (isDevelopment()) console.error(`CocoKits: the icon "${name}" did not load: ${reason}.`);
}

async function resolveLoaded(name: string, load: IconLoader): Promise<Icon | undefined> {
  let loaded: Icon | string;
  try {
    loaded = await load();
  } catch (error) {
    logLoadError(name, error instanceof Error ? error.message : 'the loader rejected');
    return undefined;
  }
  if (typeof loaded !== 'string') return loaded;
  const icon = parseSvg(loaded);
  if (!icon) logLoadError(name, 'the loader did not return an SVG element with a viewBox');
  return icon;
}

/**
 * Creates an icon registry. It starts with the base icons (`chevron-down`, `check`, `minus`, `close`) and looks a
 * name up in the parent registry when it has none of its own.
 *
 * @remarks
 * Make one registry per app or per rendered tree, never a module-level one: a server that renders several requests
 * must not share icons between them.
 *
 * @param parent - The registry to fall back to.
 * @returns The registry. Call `destroy()` when its scope ends.
 * @example
 * const registry = createIconRegistry();
 * registry.registerIcons({ search: searchIcon });
 */
export function createIconRegistry(parent?: IconRegistry): IconRegistry {
  const eager = new Map<string, Icon>(Object.entries(baseIcons));
  const loaders = new Map<string, IconLoader>();
  const loaded = new Map<string, Icon>();
  const failed = new Set<string>();
  const running = new Map<string, Load>();
  const listeners = new Set<() => void>();
  let destroyed = false;

  const notify = (): void => {
    for (const listener of [...listeners]) listener();
  };

  const forget = (name: string): void => {
    eager.delete(name);
    loaders.delete(name);
    loaded.delete(name);
    failed.delete(name);
    running.delete(name);
  };

  const startLoad = (name: string, loader: IconLoader): Load => {
    const entry: Load = {
      promise: resolveLoaded(name, loader).then((icon) => {
        if (running.get(name) !== entry || destroyed) return icon;
        running.delete(name);
        if (icon) {
          loaded.set(name, icon);
          notify();
        } else {
          failed.add(name);
        }
        return icon;
      }),
    };
    running.set(name, entry);
    return entry;
  };

  return {
    registerIcons(icons) {
      for (const [name, icon] of Object.entries(icons)) {
        forget(name);
        eager.set(name, icon);
      }
      notify();
    },
    registerIcon(name, load) {
      forget(name);
      loaders.set(name, load);
      notify();
    },
    has: (name) => eager.has(name) || loaders.has(name) || (parent?.has(name) ?? false),
    get: (name) => eager.get(name) ?? loaded.get(name) ?? (loaders.has(name) ? undefined : parent?.get(name)),
    async load(name) {
      const ready = eager.get(name) ?? loaded.get(name);
      if (ready) return ready;
      const loader = loaders.get(name);
      if (!loader) return parent?.load(name);
      if (failed.has(name)) return undefined;
      return (running.get(name) ?? startLoad(name, loader)).promise;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    destroy() {
      destroyed = true;
      listeners.clear();
      loaded.clear();
      running.clear();
    },
  };
}
