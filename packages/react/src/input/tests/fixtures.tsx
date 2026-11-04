import { StrictMode, type ReactElement } from 'react';
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

export function strict(ui: ReactElement): ReactElement {
  return <StrictMode>{ui}</StrictMode>;
}

/** Resolves after the next task, where the cdk reports a reset. */
export const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** Resolves after the next animation frame, where the accessible-name check runs. */
export const nextFrame = (): Promise<void> =>
  new Promise((resolve) =>
    requestAnimationFrame(() => {
      resolve();
    }),
  );

export function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error('Expected the element to exist.');
  return value;
}

/** The Input example markup: a label, an input and two hints, with no id written. */
export function EmailField({ id }: { readonly id?: string }): ReactElement {
  return (
    <FormField
      id={id}
      label={<Label>Email address</Label>}
      hint={
        <>
          <Hint>We only use it for the receipt.</Hint>
          <Hint>No spam.</Hint>
        </>
      }
    >
      <Input type="email" />
    </FormField>
  );
}
