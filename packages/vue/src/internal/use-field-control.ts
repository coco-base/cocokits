import { inject, onBeforeUnmount, onMounted, ref, watch, type InjectionKey, type Ref } from 'vue';
import type { FormFieldControlState } from '@cocokits/machines/form-field';
import { isDevelopment } from '@cocokits/vue-core';
import type { FormFieldContextValue } from './form-field-context';

/**
 * Marks the content of a zone of a FormField (Leading, Trailing, Prefix, Suffix): a control inside it reads the
 * field's state but does not claim the field, so the Label, the ids and the description stay with the field's own
 * control. Not exported from any entry point.
 */
export const FIELD_ZONE_KEY: InjectionKey<true> = Symbol('cck-field-zone');

/**
 * A control's membership in its FormField: after mount it claims the field (the first control to claim is the
 * field's control), reports its state now and whenever it changes, and releases the claim when it unmounts.
 * A control that does not get the claim warns in development. A control in a zone of the field does neither.
 * Call it in `setup`, before the machine call reads the returned flag.
 *
 * @param field - The enclosing field's context, or `undefined` outside a FormField.
 * @param elementRef - The control's native element, set by mount.
 * @param control - The state to report to the field.
 * @param consequence - The end of the warning's second sentence: what the control does not get.
 * @returns Whether the control is the field's control; `true` until mount, `false` in a zone of a field.
 */
export function useFieldControl(
  field: FormFieldContextValue | undefined,
  elementRef: Readonly<Ref<HTMLElement | null>>,
  control: () => FormFieldControlState,
  consequence: string,
): Ref<boolean> {
  if (field && inject(FIELD_ZONE_KEY, false)) return ref(false);
  const primary = ref(true);
  const token = {};
  onMounted(() => {
    const element = elementRef.value;
    if (!field || !element) return;
    primary.value = field.claim(token, element);
    if (primary.value) {
      // The watcher ends with the component.
      watch(
        control,
        (state) => {
          field.report(token, state);
        },
        { immediate: true },
      );
    } else if (isDevelopment()) {
      console.warn(`CocoKits: a FormField holds one control. This control ${consequence}. Use a second FormField.`);
    }
  });
  onBeforeUnmount(() => {
    field?.release(token);
  });
  return primary;
}
