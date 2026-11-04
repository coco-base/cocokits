import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  type ComputedRef,
  type Ref,
  type ShallowRef,
} from 'vue';
import { isDevelopment, useFormParticipation } from '@cocokits/vue-core';
import type {
  FormFieldControlContext,
  FormFieldControlProps,
  FormFieldControlState,
} from '@cocokits/machines/form-field';
import { hasAccessibleName } from '@cocokits/utils';
import { useFormFieldContext } from './form-field-context';
import { useFieldControl } from './use-field-control';

/** The props the Input and the Textarea share; the composable reads them and the component binds the rest. */
export interface TextControlProps {
  readonly id?: string | undefined;
  readonly ariaDescribedby?: string | undefined;
  readonly name?: string | undefined;
  readonly disabled?: boolean | undefined;
  readonly readonly?: boolean | undefined;
  readonly required?: boolean | undefined;
  readonly invalid?: boolean | undefined;
  readonly pending?: boolean | undefined;
  readonly hidden?: boolean | undefined;
  readonly touched?: boolean | undefined;
  readonly dirty?: boolean | undefined;
  readonly submitted?: boolean | undefined;
}

/** The facts and the text the machine of a text control takes (the Input adds its `type`). */
export type TextControlMachineState = Omit<FormFieldControlProps, 'filled'> & {
  readonly value?: string | null | undefined;
};

/** What differs between the controls. */
export interface TextControlOptions<E extends HTMLInputElement | HTMLTextAreaElement> {
  /** The name of the component, for the development warning. */
  readonly componentName: 'Input' | 'Textarea';
  /** The `v-model` of the component (`useModel` in the component). */
  readonly model: Ref<string | null | undefined>;
  /** The template ref of the control's element. */
  readonly elementRef: Readonly<ShallowRef<E | null>>;
  /** Returns the theme attributes of the root part. */
  readonly rootThemeAttrs: () => object;
  /** The machine call of the control. */
  readonly getParts: (
    state: TextControlMachineState,
    field?: FormFieldControlContext,
  ) => { readonly root: { readonly class: string }; readonly control: FormFieldControlState };
  /** The text as the DOM holds it; the Textarea shows CR and CRLF as LF. Default: the text itself. */
  readonly toDomText?: ((text: string) => string) | undefined;
}

/** What the component binds on its element. */
export interface TextControl {
  /** The text for the element's `value`. */
  readonly text: ComputedRef<string>;
  /** The block class; the template joins it with the author's `class`. */
  readonly className: ComputedRef<string>;
  /** The attributes for `v-bind`: the author's attrs under the theme, the machine's facts and ids. */
  readonly boundAttrs: () => Record<string, unknown>;
  readonly onInput: (event: Event) => void;
  readonly onFocus: () => void;
  readonly onBlur: () => void;
}

const unchangedText = (text: string): string => text;

/**
 * The behaviour of a native text control (`input` or `textarea`) in a FormField: the `v-model` text, the
 * tracked facts, form participation, the registration with the field and the development warnings. The
 * Input and the Textarea call it and render their own element. Call it in `setup` of a component with
 * `inheritAttrs: false`.
 *
 * @param props - The shared props of the control.
 * @param options - What differs between the controls.
 * @returns What the template binds.
 */
export function useTextControl<E extends HTMLInputElement | HTMLTextAreaElement>(
  props: TextControlProps,
  options: TextControlOptions<E>,
): TextControl {
  const { componentName, model, elementRef, rootThemeAttrs, getParts, toDomText = unchangedText } = options;
  const attrs = useAttrs();
  const field = useFormFieldContext();

  const text = computed(() => toDomText(model.value ?? ''));
  // The text a reset restores, in the DOM's form: a Textarea mounted with CRLF emits LF on reset.
  const mountValue = toDomText(model.value ?? '');
  const focused = ref(false);
  const touchedState = ref(false);
  const dirtyState = ref(false);

  /** Writes the model, which emits `update:modelValue`. The DOM follows the model afterwards, also when the parent kept the old text. */
  function change(next: string): void {
    model.value = next;
    void nextTick(() => {
      participation.syncValue();
    });
  }

  const primary = useFieldControl(
    field,
    elementRef,
    () => machine.value.control,
    'gets no generated id and no description from the field, and its state does not reach the field',
  );

  const participation = useFormParticipation({
    elementRef,
    getValue: () => text.value,
    onReset: () => {
      touchedState.value = false;
      dirtyState.value = false;
      change(mountValue);
    },
  });

  const machine = computed(() =>
    getParts(
      {
        value: model.value,
        id: props.id,
        ariaDescribedBy: props.ariaDescribedby,
        name: props.name,
        disabled: props.disabled === true || participation.fieldsetDisabled.value,
        readOnly: props.readonly,
        required: props.required,
        invalid: props.invalid,
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

  // The attrs are not reactive, so the template reads them through a function. The facts the machine renders are
  // reserved: they replace the same attribute of the author. The author's class stays; `:class` adds the block class.
  const boundAttrs = (): Record<string, unknown> => ({
    ...attrs,
    ...rootThemeAttrs(),
    ...machine.value.root,
    class: attrs.class,
  });

  onMounted(() => {
    if (field && isDevelopment() && typeof requestAnimationFrame === 'function') {
      // After the Label's `for` has committed.
      const frame = requestAnimationFrame(() => {
        if (elementRef.value && !hasAccessibleName(elementRef.value)) {
          console.warn(
            `CocoKits: ${componentName === 'Input' ? 'an' : 'a'} ${componentName} in a FormField has no accessible name. Add a Label to the FormField, or an aria-label, aria-labelledby or title to the ${componentName}.`,
          );
        }
      });
      onBeforeUnmount(() => {
        cancelAnimationFrame(frame);
      });
    }
  });

  return {
    text,
    className: computed(() => machine.value.root.class),
    boundAttrs,
    onInput: (event) => {
      dirtyState.value = true;
      change((event.target as E).value);
    },
    onFocus: () => {
      focused.value = true;
    },
    onBlur: () => {
      focused.value = false;
      touchedState.value = true;
    },
  };
}
