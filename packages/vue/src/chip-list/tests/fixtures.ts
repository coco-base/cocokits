import { screen } from '@testing-library/vue';
import { h, ref, type Ref, type VNode } from 'vue';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { ChipList } from '../index';

/** Resolves after the next task, where the cdk reports a reset. */
export const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** The text box. */
export const box = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('textbox');

/** The root of the list. */
export const listRoot = (): HTMLElement => {
  const element = document.querySelector<HTMLElement>('.cck-chip-list');
  if (!element) throw new Error('No Chip list rendered.');
  return element;
};

/** The texts of the chips, in order. */
export const chipTexts = (): string[] =>
  [...document.querySelectorAll('.cck-chip__content-wrapper')].map((node) => node.textContent);

/** The remove buttons, in order. */
export const removeButtons = (): HTMLButtonElement[] => [
  ...document.querySelectorAll<HTMLButtonElement>('.cck-chip__remove'),
];

/** A labelled list; `props` go on the ChipList. */
export const list = (props: Record<string, unknown> = {}): VNode => h(ChipList, { 'aria-label': 'Toppings', ...props });

/** A v-model parent that accepts every change and passes it to `onUpdate`. */
export function bound(
  initial: string[],
  onUpdate: (value: string[]) => void = () => undefined,
): { values: Ref<string[]>; props: () => Record<string, unknown> } {
  const values = ref(initial);
  return {
    values,
    props: () => ({
      modelValue: values.value,
      'onUpdate:modelValue': (next: string[]) => {
        values.value = next;
        onUpdate(next);
      },
    }),
  };
}

/** A field with a label, a hint and a list; `fieldProps` go on the FormField, `data-testid` is `field`. */
export function field(fieldProps: Record<string, unknown> = {}, listProps: Record<string, unknown> = {}): VNode {
  return h(
    FormField,
    { id: 'f', 'data-testid': 'field', ...fieldProps },
    {
      label: () => h(Label, null, () => 'Toppings'),
      default: () => h(ChipList, listProps),
      hint: () => h(Hint, null, () => 'Press Enter to add.'),
    },
  );
}
