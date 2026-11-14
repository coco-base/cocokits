<script setup lang="ts">
import {
  computed,
  h,
  mergeProps,
  nextTick,
  ref,
  shallowRef,
  useAttrs,
  useTemplateRef,
  watch,
  type ComponentPublicInstance,
  type VNode,
} from 'vue';
import { chipAnatomy } from '@cocokits/machines/chip';
import {
  addChipListValue,
  chipListAnatomy,
  getChipListProps,
  isChipListAddKey,
  removeChipListValue,
} from '@cocokits/machines/chip-list';
import { formFieldStateAttrs } from '@cocokits/machines/form-field';
import { Primitive, useFormParticipation, useThemeAttrs } from '@cocokits/vue-core';
import { Chip } from '../chip';
import { useFormFieldContext } from '../internal/form-field-context';
import { formHiddenInputs } from '../internal/form-hidden-inputs';
import { Nodes } from '../internal/own-content';
import { omit } from '../internal/record';
import { rootElementOf } from '../internal/root-element';
import { useDefaultModel } from '../internal/use-default-model';
import { useFieldControl } from '../internal/use-field-control';
import { useUnnamedWarning } from '../internal/use-unnamed-warning';
import type { ChipListEmits, ChipListProps } from './chip-list.types';

defineOptions({ name: 'CckChipList', inheritAttrs: false });

// A Boolean prop that is absent would be `false`; `undefined` lets the field's and the fieldset's facts decide.
const props = withDefaults(defineProps<ChipListProps>(), {
  id: undefined,
  ariaDescribedby: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  placeholder: '',
  name: undefined,
  form: undefined,
  addOnBlur: false,
  disabled: undefined,
  readonly: undefined,
  required: undefined,
  invalid: undefined,
  pending: undefined,
  hidden: undefined,
  touched: undefined,
  dirty: undefined,
  submitted: undefined,
  modelValue: undefined,
  defaultValue: undefined,
  as: 'div',
  asChild: false,
});
defineEmits<ChipListEmits>();

defineSlots<{
  /**
   * The one child the root merges onto, used with `asChild` only. The list puts its chips and its text box inside it.
   * When not set, the list renders its own element.
   *
   * @example
   * <ChipList as-child v-model="toppings" aria-label="Toppings"><section /></ChipList>
   */
  default?(): unknown;
}>();

const startValue: readonly string[] = props.defaultValue ?? [];
const model = useDefaultModel(props, 'modelValue', startValue);
const current = computed<readonly string[]>(() => model.value ?? []);

const attrs = useAttrs();
const field = useFormFieldContext();
const themeAttrs = useThemeAttrs(chipListAnatomy);
const root = useTemplateRef<ComponentPublicInstance>('root');
const input = shallowRef<HTMLInputElement | null>(null);

const draft = ref('');
const focused = ref(false);
const touchedState = ref(false);
const dirtyState = ref(false);
// The hidden inputs' `invalid` event: the list shows the invalid fact until the value changes.
const rejected = ref(false);
// A new key makes the hidden inputs again, so the browser's reset (which clears them) cannot leave one empty.
const inputsKey = ref(0);

/** Writes the model, which emits `update:modelValue`. */
function write(next: readonly string[]): void {
  dirtyState.value = true;
  model.value = [...next];
}

const primary = useFieldControl(
  field,
  input,
  () => parts.value.control,
  'gets no generated id and no description from the field, and its state does not reach the field',
);
const participation = useFormParticipation({
  elementRef: input,
  getValue: () => draft.value,
  onReset: () => {
    touchedState.value = false;
    dirtyState.value = false;
    rejected.value = false;
    draft.value = '';
    inputsKey.value += 1;
    model.value = [...startValue];
  },
});

const parts = computed(() =>
  getChipListProps(
    {
      value: current.value,
      draft: draft.value,
      placeholder: props.placeholder,
      id: props.id,
      ariaDescribedBy: props.ariaDescribedby,
      name: props.name,
      disabled: props.disabled === true || participation.fieldsetDisabled.value,
      readOnly: props.readonly,
      required: props.required,
      invalid: rejected.value ? true : props.invalid,
      pending: props.pending,
      touched: props.touched ?? touchedState.value,
      dirty: props.dirty ?? dirtyState.value,
      submitted: props.submitted ?? participation.submitted.value,
      focused: focused.value,
      hidden: props.hidden,
    },
    field ? { ids: primary.value ? field.ids.value : undefined, state: field.own.value } : undefined,
  ),
);

useUnnamedWarning('Chip list', input, {
  level: 'error',
  fix: 'Add a Label with text to its FormField, or an aria-label, or an aria-labelledby that points to an element with text.',
});

/** Moves the focus to the text box. */
function focusInput(): void {
  input.value?.focus();
}

/** The remove buttons of the chips, in order: the position of a button is the position of its value. */
function removeButtons(): HTMLElement[] {
  const container = rootElementOf(root.value);
  return container ? [...container.querySelectorAll<HTMLElement>(`.${chipAnatomy.classes.remove}`)] : [];
}

/** The position of the remove button that has the focus, or `-1`. */
function focusedButton(): number {
  const active = rootElementOf(root.value)?.ownerDocument.activeElement;
  return active ? removeButtons().indexOf(active as HTMLElement) : -1;
}

// The values changed (the parent set them, or the user did): a focused remove button whose chip is gone, would
// lose the focus with it, so the focus moves to the text box first. A button whose position stays keeps it.
watch(
  current,
  (next) => {
    rejected.value = false;
    const position = focusedButton();
    if (position >= next.length && !parts.value.control.disabled) focusInput();
  },
  { flush: 'pre' },
);
// A list that turns read-only takes the buttons out of the tab order: the focus moves to the text box.
watch(
  () => parts.value.control.readOnly === true,
  (readOnly) => {
    if (readOnly && !parts.value.control.disabled && focusedButton() >= 0) focusInput();
  },
  { flush: 'pre' },
);

/** Adds the draft text as a chip (a duplicate or an empty text adds nothing) and clears the draft. */
function commit(): void {
  const next = addChipListValue(current.value, draft.value);
  if (next !== current.value) write(next);
  draft.value = '';
  void nextTick(() => {
    participation.syncValue();
  });
}

function onKeydown(event: KeyboardEvent): void {
  if (!isChipListAddKey(event) || parts.value.chipDisabled || draft.value.trim() === '') return;
  event.preventDefault();
  commit();
}

function onBlur(): void {
  if (props.addOnBlur && !parts.value.chipDisabled && draft.value.trim() !== '') commit();
}

/** The chip at `index` asked to be removed: only that position goes, and the focus moves to the text box. */
function removeAt(index: number): void {
  const next = removeChipListValue(current.value, index);
  if (next !== current.value) write(next);
  focusInput();
}

function onFocusin(): void {
  focused.value = true;
}

function onFocusout(event: FocusEvent): void {
  const container = rootElementOf(root.value);
  if (event.relatedTarget instanceof Node && container?.contains(event.relatedTarget)) return;
  focused.value = false;
  touchedState.value = true;
}

/** A blocked submit: the list shows the invalid fact and the text box takes the focus; the event is not canceled. */
function onInvalid(): void {
  rejected.value = true;
  // The browser focuses the invalid input right after the event, so the text box takes the focus back after it.
  focusInput();
  setTimeout(focusInput, 0);
}

/** The hidden inputs render for a name or for required; one empty input blocks the submit of an empty required list. */
const formEntries = computed(() => {
  const { name, required, values } = parts.value.formInput;
  if (!name && !required) return [];
  return values.length === 0 && required ? [''] : values;
});

/** The attrs are not reactive, so the template reads them through a function. The machine's facts win. */
const rootBound = (): Record<string, unknown> =>
  mergeProps(
    omit(attrs, 'class', ...formFieldStateAttrs),
    themeAttrs.value.root,
    omit(parts.value.root, 'class'),
    { onFocusin, onFocusout },
    { class: [parts.value.root.class, attrs.class] },
  );

/** The chips, one per value and tracked by position, then the text box and the hidden form inputs. */
function tree(): VNode[] {
  const { input: inputParts, formInput, chipDisabled } = parts.value;
  return [
    ...current.value.map((text, index) =>
      h(
        Chip,
        {
          key: index,
          removable: true,
          disabled: chipDisabled,
          onRemove: () => {
            removeAt(index);
          },
        },
        () => text,
      ),
    ),
    h('input', {
      ...themeAttrs.value.input,
      ...omit(inputParts, 'class'),
      'aria-label': props.ariaLabel,
      'aria-labelledby': props.ariaLabelledby,
      class: inputParts.class,
      ref: input,
      value: draft.value,
      onInput: (event: Event) => {
        draft.value = (event.target as HTMLInputElement).value;
      },
      onKeydown,
      onBlur,
    }),
    ...formHiddenInputs({
      entries: formEntries.value,
      formInput,
      form: props.form,
      autocomplete: 'off',
      generation: inputsKey.value,
      onInvalid,
    }),
  ];
}

defineExpose({
  /**
   * The DOM element of the root: the `<div>`, or the element of the `as` component or the `asChild` child. It is
   * `null` before mount.
   *
   * @example
   * <ChipList ref="list" v-model="toppings" aria-label="Toppings" />
   * <!-- In the script: const list = useTemplateRef('list'); then list.value?.element is the root. -->
   *
   * @cckSemantic none
   * @cckParity Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return rootElementOf(root.value);
  },
  /**
   * The native text box. It is `null` before mount.
   *
   * @example
   * <ChipList ref="list" v-model="toppings" aria-label="Toppings" />
   * <!-- In the script: const list = useTemplateRef('list'); then list.value?.inputElement?.focus(). -->
   *
   * @cckSemantic none
   * @cckParity Templates reach the DOM node through the component ref.
   */
  get inputElement(): HTMLInputElement | null {
    return input.value;
  },
});
</script>

<template>
  <Primitive
    ref="root"
    v-bind="rootBound()"
    :as="as"
    :as-child="asChild || as === 'template'"
    :priority-attrs="Object.keys(omit(parts.root, 'class'))"
    :as-child-content="tree"
  >
    <slot v-if="asChild || as === 'template'" />
    <Nodes v-else :nodes="tree()" />
  </Primitive>
</template>
