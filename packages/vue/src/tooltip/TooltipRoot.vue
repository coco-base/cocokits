<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
  useId,
  watch,
} from 'vue';
import { trackFocusVisible, type FocusVisibleTracker } from '@cocokits/cdk/focus';
import { createDescription, type Description } from '@cocokits/cdk/portal';
import { tooltipIds, transitionTooltip, type TooltipDescription, type TooltipEvent } from '@cocokits/machines/tooltip';
import { isPropWritten } from '@cocokits/vue-core';
import { TOOLTIP_KEY, TOOLTIP_PROVIDER_KEY } from './tooltip.context';
import { liveElementRef } from '../internal/live-element';
import { useDefaultModel } from '../internal/use-default-model';
import type { TooltipRootEmits, TooltipRootProps } from './tooltip.types';

defineOptions({ name: 'CckTooltipRoot', inheritAttrs: false });

const props = withDefaults(defineProps<TooltipRootProps>(), {
  open: undefined,
  defaultOpen: false,
  // Unset, these take the value of the TooltipProvider, then the built-in default.
  delayDuration: undefined,
  disableHoverableContent: undefined,
  disableClosingTrigger: undefined,
  disabled: undefined,
});
defineEmits<TooltipRootEmits>();
defineSlots<{
  /**
   * The parts of the tooltip: a trigger and the content. The slot gives you the open state. When not set, the
   * tooltip has no parts.
   *
   * The root renders no element around them.
   *
   * @example
   * <TooltipRoot #default="{ open }">
   *   <TooltipTrigger>Save {{ open ? '(hint shown)' : '' }}</TooltipTrigger>
   *   <TooltipContent>Save the draft</TooltipContent>
   * </TooltipRoot>
   */
  default?(props: {
    /**
     * Whether the tooltip is open. A disabled tooltip is never shown, even when this is `true`.
     *
     * @cckSemantic none
     * @cckParity Slot prop: the state of the root.
     */
    open: boolean;
  }): unknown;
}>();

const provider = inject(TOOLTIP_PROVIDER_KEY, undefined);
const delay = computed(() => props.delayDuration ?? provider?.delayDuration.value ?? 700);
const hoverableOff = computed(() => props.disableHoverableContent ?? provider?.disableHoverableContent.value ?? false);
const closingTriggerOff = computed(() => props.disableClosingTrigger ?? provider?.disableClosingTrigger.value ?? false);
const disabled = computed(() => props.disabled ?? provider?.disabled.value ?? false);
const group = computed(() => provider?.group.value);

const instance = getCurrentInstance();
const model = useDefaultModel(props, 'open', props.defaultOpen);
// An unbound tooltip that `disabled` closed stays closed when `disabled` turns off, without a write to the model:
// that would emit `update:open`, and a prop update is no user cause.
const closedByDisabled = shallowRef(false);
const open = computed(() => model.value === true && !closedByDisabled.value);
const shown = computed(() => open.value && !disabled.value);
const id = useId();

const trigger = liveElementRef();
const description = shallowRef<TooltipDescription>('none');
const descriptionText = shallowRef<string | null>(null);
const triggerLabel = shallowRef<string | undefined>(undefined);

let timer: ReturnType<typeof setTimeout> | undefined;
function cancel(): void {
  clearTimeout(timer);
  timer = undefined;
}

function send(event: TooltipEvent): void {
  const next = transitionTooltip(
    {
      id,
      open: open.value,
      disabled: disabled.value,
      delay: delay.value,
      disableHoverableContent: hoverableOff.value,
      disableClosingTrigger: closingTriggerOff.value,
      description: description.value,
    },
    event,
  );
  if (!next) return;
  cancel();
  const schedule = next.schedule;
  if (!schedule) return;
  // Inside a delay group a hover waits less: nothing while another tooltip of the group is open or just closed.
  const wait =
    schedule.open && schedule.reason === 'hover' && group.value ? group.value.delayFor(schedule.delay) : schedule.delay;
  const apply = (): void => {
    timer = undefined;
    if (open.value === schedule.open || disabled.value) return;
    closedByDisabled.value = false;
    model.value = schedule.open; // emits update:open
  };
  if (wait > 0) timer = setTimeout(apply, wait);
  else apply();
}

// The group knows which of its tooltips are shown, and when the last one closed.
watch(
  [shown, group],
  ([isShown, current], _previous, onCleanup) => {
    if (!isShown || !current) return;
    current.opened();
    onCleanup(() => {
      current.closed();
    });
  },
  { flush: 'post' },
);

// A scrolling ancestor of the trigger (the document included) moves the trigger away from the content.
watch(
  [shown, trigger.element],
  ([isShown, element], _previous, onCleanup) => {
    const view = element?.ownerDocument.defaultView;
    if (!isShown || !element || !view) return;
    const onScroll = (event: Event): void => {
      if (event.target instanceof Node && event.target.contains(element)) send({ type: 'ANCESTOR.SCROLL', event });
    };
    view.addEventListener('scroll', onScroll, { capture: true, passive: true });
    onCleanup(() => {
      view.removeEventListener('scroll', onScroll, { capture: true });
    });
  },
  { flush: 'post' },
);

// The description element of the trigger, made after mount: the server and the first render know none.
let descriptionElement: Description | null = null;
function describe(): void {
  if (!descriptionElement) return;
  const text = descriptionText.value?.trim();
  if (disabled.value || !text) {
    descriptionElement.update('');
    description.value = 'none';
    return;
  }
  description.value = descriptionElement.update(text) ? 'described' : 'suppressed';
}
watch(
  trigger.element,
  (element, _previous, onCleanup) => {
    if (!element) return;
    const created = createDescription(element, { id: tooltipIds(id).description });
    descriptionElement = created;
    describe();
    onCleanup(() => {
      created.destroy();
      descriptionElement = null;
    });
  },
  { flush: 'post' },
);
watch([descriptionText, triggerLabel, disabled], describe, { flush: 'post' });

// Nothing is tracked on the server, where nothing can be focused anyway.
let tracker: FocusVisibleTracker | null = null;
onMounted(() => {
  tracker = trackFocusVisible(document);
});
onBeforeUnmount(() => {
  cancel();
  tracker?.destroy();
  tracker = null;
});
// Turning `disabled` on drops a pending show and closes an open tooltip without telling the parent.
watch(disabled, (value) => {
  if (!value) return;
  cancel();
  if (open.value && !isPropWritten(instance, 'open')) closedByDisabled.value = true;
});

provide(TOOLTIP_KEY, {
  id,
  open: shown,
  disabled,
  // Nothing is mounted on the server or in the first client render, so the markup matches.
  mounted: shallowRef(false),
  description,
  descriptionText,
  triggerLabel,
  triggerElement: trigger.element,
  followTrigger: trigger.follow,
  contentElement: shallowRef(null),
  reference: shallowRef(null),
  arrowElement: shallowRef(null),
  arrowHidden: shallowRef(false),
  isFocusVisible: () => tracker?.isFocusVisible() ?? false,
  send,
});
</script>

<template>
  <slot :open="open" />
</template>
