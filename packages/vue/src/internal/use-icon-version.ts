import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { IconRegistry } from '@cocokits/cdk/icon-registry';

/**
 * A counter that changes after the registry registers an icon or finishes a lazy load, so a computed that reads
 * the registry re-runs. It listens from mount to unmount only, so a server render keeps no listener.
 *
 * @internal
 * @param registry - The registry to watch.
 * @returns `track` reads the counter (call it before you read the registry).
 */
export function useIconVersion(registry: IconRegistry): { readonly track: () => number } {
  const version = ref(0);
  let stop: (() => void) | undefined;
  onMounted(() => {
    stop = registry.subscribe(() => {
      version.value++;
    });
  });
  onBeforeUnmount(() => {
    stop?.();
  });
  return { track: () => version.value };
}
