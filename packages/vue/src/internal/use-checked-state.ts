import { nextTick, shallowRef, type Ref, type ShallowRef } from 'vue';
import { useFormParticipation, type FormParticipationBinding } from '@cocokits/vue-core';

/** Options of {@link useCheckedState}. */
export interface CheckedStateOptions {
  /** The `v-model` of the component (`useModel` in the component). */
  readonly model: Ref<boolean | null | undefined>;
  /** Runs when the owner form was reset, before the value returns to its mount value. */
  readonly onReset?: (() => void) | undefined;
  /** A Radio: the model follows when the user checks another radio of the group. */
  readonly followGroup?: boolean | undefined;
  /**
   * A Radio inside a RadioGroup: the group owns the value, so the DOM follows `checked()` and a reset goes to
   * `reset` instead of the model. The model and `followGroup` are then not used.
   */
  readonly grouped?:
    | {
        /** Whether the group value is this radio's value. */
        readonly checked: () => boolean;
        /** Reports the reset of the owner form to the group. */
        readonly reset: (event: Event) => void;
      }
    | undefined;
}

/** What {@link useCheckedState} returns. */
export interface CheckedState {
  /** The template ref of the native input. */
  readonly inputRef: ShallowRef<HTMLInputElement | null>;
  /** The form facts and the sync action. */
  readonly participation: FormParticipationBinding;
  /** Writes the model, which emits `update:modelValue`. The DOM follows the model afterwards, also when the parent kept the old value. */
  readonly change: (checked: boolean) => void;
}

/**
 * The checked model of a Checkbox, Switch or Radio: the input ref, the write that emits `update:modelValue` and re-syncs the DOM,
 * and the form participation in checked mode (reset to the mount value, and the group follow of a Radio).
 *
 * @param options - The model and the optional callbacks.
 * @returns The input ref, the participation and the write action.
 */
export function useCheckedState(options: CheckedStateOptions): CheckedState {
  const { model, grouped } = options;
  const inputRef = shallowRef<HTMLInputElement | null>(null);
  const mountValue = model.value === true;

  function change(checked: boolean): void {
    model.value = checked;
    void nextTick(() => {
      participation.syncValue();
    });
  }

  const participation = useFormParticipation({
    elementRef: inputRef,
    getChecked: () => (grouped ? grouped.checked() : model.value === true),
    onReset: (event) => {
      if (grouped) {
        grouped.reset(event);
        return;
      }
      options.onReset?.();
      change(mountValue);
    },
    // The user checked another radio of the group: no event reaches this one, so the model follows here.
    onUncheckedByGroup:
      options.followGroup && !grouped
        ? () => {
            if (model.value === true) change(false);
          }
        : undefined,
  });

  return { inputRef, participation, change };
}
