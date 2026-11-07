<script setup lang="ts" generic="T">
import {
  computed,
  inject,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
  useAttrs,
  useId,
  useTemplateRef,
  watch,
  type ComponentPublicInstance,
} from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { hasInteractiveContent } from '@cocokits/utils';
import { isDevelopment, Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { toVueListeners } from '../internal/listeners';
import { omit } from '../internal/record';
import { rootElementOf } from '../internal/root-element';
import { SELECT_GROUP_KEY, SELECT_ITEM_KEY, useSelectContext } from './select.context';
import type { SelectItemEmits, SelectItemProps } from './select-list.types';

defineOptions({ name: 'CckSelectItem', inheritAttrs: false });

const props = withDefaults(defineProps<SelectItemProps<T>>(), {
  disabled: false,
  textValue: undefined,
  id: undefined,
  as: 'div',
  asChild: false,
});
const emit = defineEmits<SelectItemEmits<T>>();
defineSlots<{
  /** The content of the item: a `SelectItemIndicator` and a `SelectItemText`, never a control. */
  default?(): unknown;
}>();

const ctx = useSelectContext<T>('SelectItem');
const group = inject(SELECT_GROUP_KEY, undefined);
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
const key = useId();
const root = useTemplateRef<ComponentPublicInstance>('root');
const element = computed(() => rootElementOf(root.value) as HTMLElement | null);
const textElement = shallowRef<HTMLElement | null>(null);
const isDisabled = computed(() => props.disabled || group?.disabled.value === true);
const machine = computed(() =>
  ctx.parts.value.option({ key, value: props.value, disabled: isDisabled.value, id: props.id }),
);

provide(SELECT_ITEM_KEY, {
  setTextElement: (next: HTMLElement | null) => {
    textElement.value = next;
  },
});

// A consumer listener runs first (`mergeProps` chains it before ours); the machine skips a vetoed click. The
// machine's attributes are reserved: they replace the same attribute of the author.
const bound = computed(() =>
  mergeProps(
    themeAttrs.value.option,
    omit(attrs, 'role', 'aria-selected', 'aria-disabled', 'data-selected', 'data-highlighted', 'data-disabled'),
    omit(toVueListeners(machine.value), 'class'),
    { class: [machine.value.class, attrs.class] },
  ),
);
// The machine's attributes win over an `asChild` child's own props.
const priorityAttrs = computed(() => Object.keys(omit(machine.value, 'class')));

/** Runs the `select` listeners; a listener that prevents the event refuses the choice. */
function select(original: Event): boolean {
  const event = new CustomEvent('select', {
    cancelable: true,
    detail: { originalEvent: original, value: props.value },
  });
  emit('select', event);
  return event.defaultPrevented;
}

// Registers once per key (again when the element or the disabled fact changes). The registered value is read
// live: the latest payload, with the Root told only when `valueChangeMatters`, so an inline
// object value (new on every render) starts no further render of the Root. The key stays, so the first remover
// still works; the Root keeps the items in document order.
let payload = props.value;
const revision = shallowRef(0);
let unregister: (() => void) | undefined;
function register(): void {
  if (!element.value) return;
  unregister = ctx.registerItem({
    key,
    element: element.value,
    get value() {
      Reflect.get(revision, 'value'); // tracked: a real change of the value re-reads the item
      return payload;
    },
    disabled: isDisabled.value,
    get id() {
      return props.id;
    },
    get text() {
      return props.textValue ?? textElement.value?.textContent ?? undefined;
    },
    select,
  });
}
onMounted(() => {
  register();
  if (isDevelopment() && element.value && hasInteractiveContent(element.value)) {
    console.warn(
      'CocoKits: a <SelectItem> holds a focusable or interactive element. An item is not interactive: use plain text and markup.',
    );
  }
});
watch(
  () => props.value,
  (next) => {
    const changed = ctx.valueChangeMatters(payload, next);
    payload = next;
    if (changed) revision.value += 1;
  },
  { flush: 'sync' },
);
watch([isDisabled, element], register, { flush: 'post' });
onBeforeUnmount(() => {
  unregister?.();
});
</script>

<template>
  <Primitive ref="root" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
