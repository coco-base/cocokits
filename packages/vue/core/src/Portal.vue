<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue';
import { createPortalHost, resolveOverlayContainer, type PortalHost } from '@cocokits/cdk/portal';
import { useDirection } from './direction';
import { THEME_KEY } from './theme-context';

defineOptions({ name: 'CckPortal' });

const props = withDefaults(
  defineProps<{
    /** Whether the overlay is open. The host exists only while it is, and only after mount. */
    open?: boolean;
    /** The trigger the overlay belongs to: its ancestors give the container, the modes and the direction. */
    getTrigger: () => Element | null;
  }>(),
  { open: true },
);

defineSlots<{
  /** The overlay content, rendered inside the host. */
  default?(): unknown;
}>();

const theme = inject(THEME_KEY, undefined);
const direction = useDirection();

const hostElement = shallowRef<HTMLElement | null>(null);
let host: PortalHost | undefined;
let container: Element | ShadowRoot | undefined;
let mounted = false;

function sync(): void {
  const wanted = mounted && props.open;
  if (wanted && !host) {
    const trigger = props.getTrigger();
    if (trigger === null) return;
    host = createPortalHost({
      getTrigger: props.getTrigger,
      getDirection: () => direction.value,
      modeCollections: theme?.().themeConfig.modeCollections,
    });
    container = resolveOverlayContainer(trigger);
    hostElement.value = host.element;
  } else if (!wanted && host) {
    hostElement.value = null;
    host.destroy();
    host = undefined;
  }
}

onMounted(() => {
  mounted = true;
  sync();
});
watch(() => props.open, sync, { flush: 'post' });
// The container, modes and direction come from the trigger's ancestors: a trigger that changes its element
// (an `asChild` child swapping its root) moves the host when the new element belongs to another container.
watch(
  () => (props.open ? props.getTrigger() : null),
  (next, previous) => {
    if (!host || next === previous || next === null || resolveOverlayContainer(next) === container) return;
    hostElement.value = null;
    host.destroy();
    host = undefined;
    sync();
  },
  { flush: 'post' },
);
onBeforeUnmount(() => {
  mounted = false;
  sync();
});
</script>

<template>
  <Teleport v-if="hostElement" :to="hostElement">
    <slot />
  </Teleport>
</template>
