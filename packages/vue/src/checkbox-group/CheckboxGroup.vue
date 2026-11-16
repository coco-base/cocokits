<script setup lang="ts">
import {
  computed,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  useAttrs,
  useTemplateRef,
  type ComponentPublicInstance,
} from 'vue';
import {
  CHECKBOX_GROUP_NAME_WARNING,
  checkboxGroupAnatomy,
  getCheckboxGroupProps,
  toggleCheckboxGroupValue,
} from '@cocokits/machines/checkbox-group';
import { isDevelopment, Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { CHECKBOX_GROUP_KEY } from '../internal/checkbox-group-context';
import { nonEmpty, useFormFieldContext } from '../internal/form-field-context';
import { omit } from '../internal/record';
import { rootElementOf } from '../internal/root-element';
import { useDefaultModel } from '../internal/use-default-model';
import { useFieldControl } from '../internal/use-field-control';
import type { CheckboxGroupEmits, CheckboxGroupProps } from './checkbox-group.types';

defineOptions({ name: 'CckCheckboxGroup', inheritAttrs: false });

// A Boolean prop that is absent would be `false`; `undefined` lets the field's facts decide.
const props = withDefaults(defineProps<CheckboxGroupProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  name: undefined,
  disabled: undefined,
  orientation: undefined,
  as: 'div',
  asChild: false,
});
defineEmits<CheckboxGroupEmits>();
defineSlots<{
  /**
   * The checkboxes, in any markup. When not set, the group is empty.
   *
   * @example
   * <CheckboxGroup v-model="toppings" aria-label="Toppings">
   *   <p>Pick any.</p>
   *   <Checkbox value="cheese">Cheese</Checkbox>
   * </CheckboxGroup>
   */
  default?(): unknown;
}>();

const model = useDefaultModel(props, 'modelValue', props.defaultValue);
const value = computed<readonly string[]>(() => model.value ?? []);

const attrs = useAttrs();
const field = useFormFieldContext();
const themeAttrs = useThemeAttrs(checkboxGroupAnatomy);
const root = useTemplateRef<ComponentPublicInstance>('root');
const element = computed(() => rootElementOf(root.value) as HTMLElement | null);
const focused = ref(false);
const touched = ref(false);
const dirty = ref(false);

const stringOf = (attr: unknown): string | undefined => (typeof attr === 'string' ? attr : undefined);

const primary = useFieldControl(
  field,
  element,
  () => parts.value.control,
  'gets no generated id and no description from the field, and its state does not reach the field',
);

const parts = computed(() =>
  getCheckboxGroupProps(
    {
      value: value.value,
      orientation: props.orientation,
      id: nonEmpty(stringOf(attrs.id)),
      name: props.name,
      disabled: props.disabled,
      ariaLabel: stringOf(attrs['aria-label']),
      ariaLabelledBy: stringOf(attrs['aria-labelledby']),
      ariaDescribedBy: stringOf(attrs['aria-describedby']),
      touched: touched.value,
      dirty: dirty.value,
      focused: focused.value,
    },
    field
      ? { ids: primary.value ? field.ids.value : undefined, state: field.own.value, hasLabel: field.hasLabel.value }
      : undefined,
  ),
);

provide(CHECKBOX_GROUP_KEY, {
  value,
  name: computed(() => parts.value.checkbox.name),
  disabled: computed(() => parts.value.checkbox.disabled === true),
  set: (item, checked) => {
    const next = toggleCheckboxGroupValue(value.value, item, checked);
    if (next === value.value) return;
    dirty.value = true;
    model.value = [...next]; // emits update:modelValue
  },
});

// One frame after mount, so a Label that commits late has named the group.
onMounted(() => {
  if (!isDevelopment() || typeof requestAnimationFrame !== 'function') return;
  const frame = requestAnimationFrame(() => {
    if (!parts.value.named) console.warn(CHECKBOX_GROUP_NAME_WARNING);
  });
  onBeforeUnmount(() => {
    cancelAnimationFrame(frame);
  });
});

function onFocusin(): void {
  focused.value = true;
}
function onFocusout(event: FocusEvent): void {
  if (event.relatedTarget instanceof Node && element.value?.contains(event.relatedTarget)) return;
  focused.value = false;
  touched.value = true;
}

/** The machine's facts replace the same attribute of the author; the author's `class` joins the block class. */
const bound = computed(() =>
  mergeProps(
    themeAttrs.value.root,
    omit(
      attrs,
      'class',
      'id',
      'role',
      'aria-label',
      'aria-labelledby',
      'aria-describedby',
      'data-disabled',
      'data-orientation',
    ),
    omit(parts.value.root, 'class'),
    { onFocusin, onFocusout },
    { class: [parts.value.root.class, attrs.class] },
  ),
);
const priorityAttrs = computed(() => Object.keys(omit(parts.value.root, 'class')));

defineExpose({
  /**
   * The DOM element of the root: the `<div>`, or the element of the `as` component or the `asChild` child. It is
   * `null` before mount.
   *
   * @example
   * <CheckboxGroup ref="toppings" v-model="chosen" aria-label="Toppings">...</CheckboxGroup>
   * <!-- In the script: const toppings = useTemplateRef('toppings'); then toppings.value?.element is the root. -->
   *
   * @cckSemantic none
   * @cckParity Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return rootElementOf(root.value);
  },
});
</script>

<template>
  <Primitive ref="root" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
