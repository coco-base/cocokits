import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useAttrs,
  useId,
  watchEffect,
  type ComputedRef,
  type Ref,
  type ShallowRef,
} from 'vue';
import { hasChoiceControlName } from '@cocokits/utils';
import { isDevelopment } from '@cocokits/vue-core';
import type { CheckboxProps } from '@cocokits/machines/checkbox';
import type { FormFieldControlContext, FormFieldControlState } from '@cocokits/machines/form-field';
import type { CheckControlProps } from './check-control.types';
import { choiceInputProps, choiceRootAttrs } from './choice-attrs';
import { nonEmpty, useFormFieldContext } from './form-field-context';
import { declaredInputAttrs } from './record';
import { useCheckedState } from './use-checked-state';
import { useFieldControl } from './use-field-control';

/** The parts of a machine call that the composable reads: the root, the input and the report for the field. */
export interface CheckControlMachine {
  readonly root: { readonly class: string };
  readonly input: { readonly class: string; readonly 'aria-readonly'?: 'true' | undefined };
  readonly control: FormFieldControlState;
}

/** What differs between the Checkbox and the Switch. */
export interface CheckControlOptions<P extends CheckControlMachine> {
  /** The name of the component, for the development warnings. */
  readonly componentName: 'Checkbox' | 'Switch';
  /** The `v-model` of the component (`useModel` in the component). */
  readonly model: Ref<boolean | null | undefined>;
  /** Returns the theme attributes of the root part. */
  readonly rootThemeAttrs: () => object;
  /** Returns the theme attributes of the input part. */
  readonly inputThemeAttrs: () => object;
  /** The machine call of the control. */
  readonly getParts: (state: CheckboxProps, field?: FormFieldControlContext) => P;
  /** Whether the control shows the mixed state; only the Checkbox does. The prop owns it. Default: never. */
  readonly isMixed?: (() => boolean) | undefined;
  /** The nodes of the label that are not the author's content; the Switch's track. Default: none. */
  readonly ignoredLabelNodes?: ((label: HTMLLabelElement) => readonly Node[]) | undefined;
}

/** What the component binds. */
export interface CheckControl<P extends CheckControlMachine> {
  /** The machine result: the props of every part and the report for the field. */
  readonly parts: ComputedRef<P>;
  /** The template ref of the native input. */
  readonly inputRef: Readonly<ShallowRef<HTMLInputElement | null>>;
  /** The ref object of the label part; pass it as `ref` of the label vnode. */
  readonly labelRef: Ref<HTMLLabelElement | null>;
  /** The attributes of the root: the theme, the facts, and the author's `class` and `style`. */
  readonly rootAttrs: () => Record<string, unknown>;
  /** The props of the input vnode: the author's attrs under the machine's, the ref and the handlers. */
  readonly inputProps: () => Record<string, unknown>;
}

/**
 * The behaviour of a Checkbox or a Switch around a native checkbox input: the `v-model` value, the tracked
 * facts, form participation, the registration with the FormField, the mixed state and the development
 * warnings. Call it in `setup` of a component with `inheritAttrs: false`.
 *
 * @param props - The shared props of the control.
 * @param options - What differs between the controls.
 * @returns What the component renders.
 */
export function useCheckControl<P extends CheckControlMachine>(
  props: CheckControlProps,
  options: CheckControlOptions<P>,
): CheckControl<P> {
  const { componentName, model, rootThemeAttrs, inputThemeAttrs, getParts } = options;
  const isMixed = options.isMixed ?? (() => false);
  const attrs = useAttrs();
  const field = useFormFieldContext();
  const labelRef = shallowRef<HTMLLabelElement | null>(null);

  // The input always has an id, because the inner label needs one: the author's, the field's, or a generated one.
  const generatedId = useId();
  const focused = ref(false);
  const touchedState = ref(false);
  const dirtyState = ref(false);

  const { inputRef, participation, change } = useCheckedState({
    model,
    onReset: () => {
      touchedState.value = false;
      dirtyState.value = false;
    },
  });
  const primary = useFieldControl(
    field,
    inputRef,
    () => parts.value.control,
    'keeps its own generated id and gets no description from the field, and its state does not reach the field',
  );

  const parts = computed(() => {
    const ids = field && primary.value ? field.ids.value : undefined;
    return getParts(
      {
        checked: model.value,
        id: nonEmpty(props.id) ?? (ids ? undefined : generatedId),
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
      field ? { ids, state: field.own.value } : undefined,
    );
  });

  // The DOM property has no attribute: set it after mount and after every change of the prop.
  watchEffect(
    () => {
      if (inputRef.value) inputRef.value.indeterminate = isMixed();
    },
    { flush: 'post' },
  );

  /** Development only: warns when nothing names the input (an empty label part and no other name source). */
  function warnWithoutName(): void {
    const input = inputRef.value;
    const label = labelRef.value;
    if (!input || !label) return;
    const named = hasChoiceControlName(input, label, options.ignoredLabelNodes?.(label));
    if (!named) {
      console.warn(
        `CocoKits: a ${componentName} has no accessible name. Put the caption inside it, or add an aria-label, aria-labelledby or title, or a <label for> that points at its id.`,
      );
    }
  }

  onMounted(() => {
    if (isDevelopment() && typeof requestAnimationFrame === 'function') {
      // After the field Label's `for` has committed.
      const frame = requestAnimationFrame(warnWithoutName);
      onBeforeUnmount(() => {
        cancelAnimationFrame(frame);
      });
    }
  });

  // The attrs are not reactive, so the template reads them through functions. The facts the machine renders are
  // reserved: they replace the same attribute of the author, `hidden` (a prop here) included. The author's `class`
  // and `style` stay on the root.
  const rootAttrs = (): Record<string, unknown> => choiceRootAttrs(attrs, rootThemeAttrs(), parts.value.root);

  const inputProps = (): Record<string, unknown> =>
    choiceInputProps(attrs, {
      theme: inputThemeAttrs(),
      declared: declaredInputAttrs(props),
      machine: parts.value.input,
      own: {
        ref: inputRef,
        // A read-only control cancels the activation, so the browser restores the state and no change fires.
        onClick: (event: Event) => {
          if (parts.value.input['aria-readonly'] === 'true') event.preventDefault();
        },
        onChange: (event: Event) => {
          const input = event.target as HTMLInputElement;
          dirtyState.value = true;
          change(input.checked);
          input.indeterminate = isMixed(); // the browser clears the mixed state on a click; the prop owns it
        },
        onFocus: () => {
          focused.value = true;
        },
        onBlur: () => {
          focused.value = false;
          touchedState.value = true;
        },
      },
    });

  return { parts, inputRef, labelRef, rootAttrs, inputProps };
}
