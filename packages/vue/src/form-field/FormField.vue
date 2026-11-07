<script setup lang="ts">
import {
  computed,
  h,
  onMounted,
  provide,
  shallowRef,
  ref,
  useId,
  useAttrs,
  useSlots,
  useTemplateRef,
  type ComponentPublicInstance,
  type VNode,
} from 'vue';
import {
  formFieldAnatomy,
  formFieldIds,
  getFormFieldProps,
  resolveFormFieldState,
  isSameFormFieldControlState,
  type FormFieldControlState,
} from '@cocokits/machines/form-field';
import { shouldFocusControl } from '@cocokits/utils';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import {
  FORM_FIELD_KEY,
  FORM_FIELD_LABEL_KEY,
  FORM_FIELD_STATE_KEY,
  nonEmpty,
  type FormFieldContextValue,
  type FormFieldLabelContextValue,
} from '../internal/form-field-context';
import { ownPartIds, withPartIds } from '../internal/field-parts';
import { rootElementOf } from '../internal/root-element';
import type { FormFieldProps } from './form-field.types';

defineOptions({ name: 'CckFormField', inheritAttrs: false });

const props = withDefaults(defineProps<FormFieldProps>(), {
  as: 'div',
  asChild: false,
  id: undefined,
  disabled: false,
  readonly: false,
  required: false,
  invalid: false,
  hideRequiredMarker: false,
  hidden: false,
});

defineSlots<{
  /** The label of the control. */
  label?(): unknown;
  /** The control. */
  default?(): unknown;
  /** The hints. Several are allowed. */
  hint?(): unknown;
  /** Content outside the box, before it. */
  leading?(): unknown;
  /** Content inside the box, before the control. */
  prefix?(): unknown;
  /** Content inside the box, after the control. */
  suffix?(): unknown;
  /** Content outside the box, after it. */
  trailing?(): unknown;
  /** The error messages, after the hints. Several are allowed. */
  error?(): unknown;
}>();

/** The slots as the author passes them, read by name. */
const slots: Partial<
  Record<'label' | 'default' | 'hint' | 'leading' | 'prefix' | 'suffix' | 'trailing' | 'error', () => VNode[]>
> = useSlots();
const themeAttrs = useThemeAttrs(formFieldAnatomy);

const generatedId = useId();
const fieldId = computed(() => nonEmpty(props.id) ?? generatedId);
const authorLabelId = shallowRef<string | undefined>(undefined);
// The `id` the author wrote on each hint and error, read from the slots on every render, so the ids are there from
// the first render (also on the server) and a control can list them.
const ownParts = shallowRef<{ hints: (string | undefined)[]; errors: (string | undefined)[] }>({
  hints: [],
  errors: [],
});
const sameList = (a: readonly unknown[], b: readonly unknown[]): boolean =>
  a.length === b.length && a.every((id, index) => id === b[index]);
const ids = computed(() => {
  const generated = formFieldIds(fieldId.value, ownParts.value);
  return authorLabelId.value === undefined ? generated : { ...generated, label: authorLabelId.value };
});
const own = computed(() => ({
  disabled: props.disabled,
  readOnly: props.readonly,
  required: props.required,
  invalid: props.invalid,
  hideRequiredMarker: props.hideRequiredMarker,
}));

// What the registered control reported. The first control to claim is the field's control until it unmounts.
const reported = shallowRef<FormFieldControlState | undefined>(undefined);
let owner: object | null = null;
let controlElement: HTMLElement | null = null;
// After mount every control has registered, so a Label without a control can drop its `for`.
const settled = ref(false);
onMounted(() => {
  settled.value = true;
});

const inputWrapper = shallowRef<HTMLElement | null>(null);
const context: FormFieldContextValue = {
  ids,
  own,
  inputWrapper,
  claim: (token, element) => {
    if (owner === null) {
      owner = token;
      controlElement = element;
    }
    return owner === token;
  },
  release: (token) => {
    if (owner !== token) return;
    owner = null;
    controlElement = null;
    reported.value = undefined;
  },
  report: (token, state) => {
    if (owner === token && !isSameFormFieldControlState(reported.value, state)) reported.value = state;
  },
};
const state = computed(() => resolveFormFieldState(own.value, reported.value));
const labelContext: FormFieldLabelContextValue = {
  required: computed(() => state.value.required),
  hideRequiredMarker: computed(() => props.hideRequiredMarker),
  authorId: authorLabelId,
  controlId: computed(() => (reported.value ? reported.value.id : settled.value ? undefined : ids.value.control)),
};
provide(FORM_FIELD_KEY, context);
provide(FORM_FIELD_LABEL_KEY, labelContext);
provide(FORM_FIELD_STATE_KEY, state);

const parts = computed(() => getFormFieldProps({ state: state.value, fieldId: fieldId.value }));
/** The root: the author's `id` only when given, and hidden by the author or by the control. */
const rootAttrs = computed(() => {
  const { class: className, ...root } = parts.value.root;
  return {
    className,
    attrs: { ...themeAttrs.value.root, ...root, id: nonEmpty(props.id), hidden: props.hidden || root.hidden },
  };
});
const attrs = useAttrs();
// The attrs are not reactive, so the template reads them through a function. The state facts the machine renders are
// reserved: they replace the same attribute of the author. The author's class joins the block class in the template.
function boundAttrs(): Record<string, unknown> {
  return { ...attrs, ...rootAttrs.value.attrs, class: attrs.class };
}

/** Whether the FormField merges onto its slot child: `asChild`, or `as="template"`, which means the same. */
const merges = computed(() => props.asChild || props.as === 'template');

/** A press on the input wrapper belongs to the control: see `shouldFocusControl`. */
function onInputWrapperPress(event: MouseEvent): void {
  if (!controlElement || !shouldFocusControl(event, controlElement)) return;
  if (event.type === 'click') controlElement.focus();
  else if (controlElement.ownerDocument.activeElement === controlElement) event.preventDefault();
}

/** The nodes of a slot, none when the author left it out. */
function slotNodes(name: keyof typeof slots): VNode[] {
  return slots[name]?.() ?? [];
}

/** The zones around a control, written once for both renderings. */
function zones(control: VNode[] = []): VNode[] {
  const hints = slotNodes('hint');
  const errors = slotNodes('error');
  const own = { hints: ownPartIds(hints), errors: ownPartIds(errors) };
  if (!sameList(own.hints, ownParts.value.hints) || !sameList(own.errors, ownParts.value.errors)) ownParts.value = own;
  const partIds = formFieldIds(fieldId.value, own);
  return [
    ...slotNodes('label'),
    h('div', { ...themeAttrs.value.wrapper, class: parts.value.wrapper.class }, [
      ...slotNodes('leading'),
      h(
        'div',
        {
          ref: (element: unknown) => {
            inputWrapper.value = element as HTMLElement | null;
          },
          ...themeAttrs.value.inputWrapper,
          class: parts.value.inputWrapper.class,
          onMousedown: onInputWrapperPress,
          onClick: onInputWrapperPress,
        },
        [...slotNodes('prefix'), ...control, ...slotNodes('suffix')],
      ),
      ...slotNodes('trailing'),
    ]),
    h('div', { ...themeAttrs.value.feedbackWrapper, ...parts.value.feedbackWrapper }, [
      ...withPartIds(hints, partIds.hints),
      ...withPartIds(errors, partIds.errors),
    ]),
  ];
}
/** Renders nodes made in the parent's render, so a changed slot re-renders them. */
const Nodes = (props: { nodes: VNode[] }): VNode[] => props.nodes;

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the FormField: the `<div>`, or the element of the `as` component or `asChild` child.
   * `null` before mount.
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
  <Primitive
    ref="root"
    v-bind="boundAttrs()"
    :class="rootAttrs.className"
    :as="as"
    :as-child="merges"
    :as-child-content="zones"
  >
    <slot v-if="merges" />
    <Nodes v-else :nodes="zones(slots.default?.() ?? [])" />
  </Primitive>
</template>
