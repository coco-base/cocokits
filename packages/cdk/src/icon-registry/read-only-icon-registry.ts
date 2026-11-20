import type { IconRegistry } from './create-icon-registry';

/**
 * Wraps a registry so it can be read but not written. `has`, `get`, `load` and `subscribe` go to the registry;
 * `registerIcons` and `registerIcon` call `onWrite` and change nothing; `destroy` does nothing.
 *
 * Use it for the registry a framework adapter gives out when no provider exists, so no request can leak icons into it.
 *
 * Trusted content only: the icons of the wrapped registry are inserted as markup, with no sanitising.
 *
 * @param registry - The registry to read from.
 * @param onWrite - Called on every write attempt, for example to log an error.
 * @returns A read-only view of the registry.
 * @example
 * const readOnly = createReadOnlyIconRegistry(createIconRegistry(), () => console.error('No provider.'));
 */
export function createReadOnlyIconRegistry(registry: IconRegistry, onWrite: () => void): IconRegistry {
  return {
    registerIcons: () => {
      onWrite();
    },
    registerIcon: () => {
      onWrite();
    },
    has: (name) => registry.has(name),
    get: (name) => registry.get(name),
    load: (name) => registry.load(name),
    subscribe: (listener) => registry.subscribe(listener),
    destroy: () => undefined,
  };
}
