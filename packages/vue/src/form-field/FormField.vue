<script setup lang="ts">
import {
  cloneVNode,
  computed,
  h,
  onBeforeUpdate,
  onMounted,
  provide,
  shallowRef,
  triggerRef,
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
import { isDevelopment, Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { FieldError } from '../field-error';
import { Hint } from '../hint';
import {
  FORM_FIELD_KEY,
  FORM_FIELD_LABEL_KEY,
  FORM_FIELD_STATE_KEY,
  nonEmpty,
  type FormFieldContextValue,
  type FormFieldLabelContextValue,
} from '../internal/form-field-context';
import { readZone, withPartIds } from '../internal/field-parts';
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
  /**
   * The label of the control. When not set, the field has no label, and the control needs another name.
   *
   * @example
   * <template #label><Label>Email</Label></template>
   */
  label?(): unknown;
  /**
   * The control: an Input, a Textarea or your own control. When not set, the field has no control.
   *
   * @example
   * <FormField><template #label><Label>Email</Label></template><Input type="email" /></FormField>
   */
  default?(): unknown;
  /**
   * The hints. Several are allowed. When not set, the field shows no hint.
   *
   * Put each Hint directly in the slot. A plain text renders inside a Hint. Anything else is not listed, and the
   * field warns once in development.
   *
   * @example
   * <template #hint><Hint>We only use it for the receipt.</Hint></template>
   */
  hint?(): unknown;
  /**
   * Content outside the box, before it. When not set, nothing shows there.
   *
   * @example
   * <template #leading><Leading>To</Leading></template>
   */
  leading?(): unknown;
  /**
   * Content inside the box, before the control. When not set, nothing shows there.
   *
   * @example
   * <template #prefix><Prefix>$</Prefix></template>
   */
  prefix?(): unknown;
  /**
   * Content inside the box, after the control. When not set, nothing shows there.
   *
   * @example
   * <template #suffix><Suffix>kg</Suffix></template>
   */
  suffix?(): unknown;
  /**
   * Content outside the box, after it. When not set, nothing shows there.
   *
   * @example
   * <template #trailing><Trailing><Button>Check</Button></Trailing></template>
   */
  trailing?(): unknown;
  /**
   * The error messages, after the hints. Several are allowed. When not set, the field shows no error.
   *
   * Put each FieldError directly in the slot. A plain text renders inside a FieldError that always shows. Anything
   * else is not listed, and the field warns once in development.
   *
   * @example
   * <template #error><FieldError>Enter an email address.</FieldError></template>
   */
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
const isHint = (node: VNode): boolean => node.type === Hint;
const isFieldError = (node: VNode): boolean => node.type === FieldError;
// The slots as a ref, triggered before each render of the field: the author's render can pass new slot functions.
const currentSlots = shallowRef(slots);
onBeforeUpdate(() => {
  triggerRef(currentSlots);
});
// The hint and error zones, read once and shared by the render and the ids. The read tracks what the slots read,
// so a part that a slot adds or removes reads the zones again. The ids do not depend on which reads them first,
// and the control lists them from the first render, also on the server.
const zoneParts = computed(() => {
  const { hint, error } = currentSlots.value;
  return {
    hints: readZone(hint?.() ?? [], isHint, (text) => h(Hint, null, () => text)),
    // A plain text error was always shown before it became a FieldError; `force` keeps that.
    errors: readZone(error?.() ?? [], isFieldError, (text) => h(FieldError, { force: true }, () => text)),
  };
});
const ids = computed(() => {
  const { hints, errors } = zoneParts.value;
  const generated = formFieldIds(fieldId.value, { hints: hints.ownIds, errors: errors.ownIds });
  return authorLabelId.value === undefined ? generated : { ...generated, label: authorLabelId.value };
});
let warnedUnlisted = false;
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

/** The cached zone nodes for this render: a node mounted by an earlier render is copied, as a render must not reuse one. */
function mountedOnce(nodes: readonly VNode[]): VNode[] {
  return nodes.map((node) => (node.el ? cloneVNode(node) : node));
}

/** The zones around a control, written once for both renderings. */
function zones(control: VNode[] = []): VNode[] {
  const { hints, errors } = zoneParts.value;
  // A console message, not state: it is said once per field.
  if ((hints.unlisted || errors.unlisted) && !warnedUnlisted && isDevelopment()) {
    warnedUnlisted = true;
    console.warn(
      'CocoKits: a FormField lists only the Hint and FieldError parts and the plain text put directly in its hint ' +
        'or error zone. Other content there, such as an element, a wrapper or a component, is not listed and does ' +
        'not describe the control.',
    );
  }
  const partIds = ids.value;
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
      ...withPartIds(mountedOnce(hints.nodes), isHint, partIds.hints),
      ...withPartIds(mountedOnce(errors.nodes), isFieldError, partIds.errors),
    ]),
  ];
}
/** Renders nodes made in the parent's render, so a changed slot re-renders them. */
const Nodes = (props: { nodes: VNode[] }): VNode[] => props.nodes;

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the FormField: the `<div>`, or the element of the `as` component or the `asChild` child. It is
   * `null` before mount.
   *
   * @example
   * <FormField ref="field"><template #label><Label>Email</Label></template><Input /></FormField>
   * <!-- In the script: const field = useTemplateRef('field'); then field.value?.element is the element. -->
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
