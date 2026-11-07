import { h, type VNode } from 'vue';
import { textareaAnatomy } from '@cocokits/machines/textarea';
import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';
import { FieldError } from '../../field-error';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { Leading } from '../../leading';
import { Prefix } from '../../prefix';
import { Suffix } from '../../suffix';
import { Trailing } from '../../trailing';
import { Textarea } from '../index';

/** A theme config with one option on the textarea anatomy. */
export const textareaThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    [textareaAnatomy.block]: {
      probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(textareaAnatomy.parts) },
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

/** A field with every zone, a Textarea, two hints and a forced FieldError, slots written in a mixed order. */
export function messageField(id?: string): VNode {
  return h(
    FormField,
    { id },
    {
      error: () => h(FieldError, { force: true }, () => 'Write a message.'),
      trailing: () => h(Trailing, null, () => 'Trailing'),
      suffix: () => h(Suffix, null, () => 'Suffix'),
      label: () => h(Label, null, () => 'Message'),
      prefix: () => h(Prefix, null, () => 'Prefix'),
      leading: () => h(Leading, null, () => 'Leading'),
      hint: () => [h(Hint, null, () => 'Be kind.'), h(Hint, null, () => 'Be short.')],
      default: () => h(Textarea, { rows: 3 }),
    },
  );
}
