import { screen } from '@testing-library/vue';
import { h, type VNode } from 'vue';
import { inputAnatomy } from '@cocokits/machines/input';
import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { Input } from '../index';

/** A theme config with one option on the input anatomy. */
export const inputThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    [inputAnatomy.block]: {
      probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(inputAnatomy.parts) },
    },
  },
});

/** Resolves after the next task, where the cdk reports a reset. */
export const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** Resolves after the next animation frame, where the accessible-name check runs. */
export const nextFrame = (): Promise<void> =>
  new Promise((resolve) =>
    requestAnimationFrame(() => {
      resolve();
    }),
  );

/** A field with a label and a control; `fieldProps` go on the FormField, `data-testid` is `field`. */
export function field(
  fieldProps: Record<string, unknown> = {},
  control: () => VNode | VNode[] = () => h(Input),
  label: (() => VNode) | null = () => h(Label, null, () => 'Name'),
): VNode {
  return h(FormField, { 'data-testid': 'field', ...fieldProps }, { label: label ?? undefined, default: control });
}

/** The Input story markup: a label, an input and two hints, with no id written. */
export function emailField(id?: string): VNode {
  return h(
    FormField,
    { id },
    {
      label: () => h(Label, null, () => 'Email address'),
      default: () => h(Input, { type: 'email' }),
      hint: () => [h(Hint, null, () => 'We only use it for the receipt.'), h(Hint, null, () => 'No spam.')],
    },
  );
}

/** The text box. */
export const control = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('textbox');
