import { screen } from '@testing-library/react';
import { StrictMode, type ReactElement } from 'react';
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

export function strict(ui: ReactElement): ReactElement {
  return <StrictMode>{ui}</StrictMode>;
}

/** Resolves after the next task, where the cdk reports a reset. */
export const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

export function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected the element to exist.');
  return value;
}

/** A field with every zone, a Textarea, two hints and a forced FieldError, props written in a mixed order. */
export function MessageField({ id }: { readonly id?: string }): ReactElement {
  return (
    <FormField
      id={id}
      error={<FieldError force>Write a message.</FieldError>}
      trailing={<Trailing>Trailing</Trailing>}
      suffix={<Suffix>Suffix</Suffix>}
      label={<Label>Message</Label>}
      prefix={<Prefix>Prefix</Prefix>}
      leading={<Leading>Leading</Leading>}
      hint={
        <>
          <Hint>Be kind.</Hint>
          <Hint>Be short.</Hint>
        </>
      }
    >
      <Textarea rows={3} />
    </FormField>
  );
}

/** The text area. */
export const control = (): HTMLTextAreaElement => screen.getByRole<HTMLTextAreaElement>('textbox');
