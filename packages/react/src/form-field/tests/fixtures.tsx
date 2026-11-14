import { StrictMode, type ReactElement } from 'react';
import { formFieldAnatomy } from '@cocokits/machines/form-field';
import { hintAnatomy } from '@cocokits/machines/hint';
import { labelAnatomy } from '@cocokits/machines/label';
import { defineThemeConfig, type Anatomy, type ThemeConfig } from '@cocokits/shared';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { FormField } from '../index';

const probe = (anatomy: Anatomy<string, Record<string, unknown>>) => ({
  probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(anatomy.parts) },
});

/** A theme config with one option that targets every part of the three components. */
export const allPartsConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    [formFieldAnatomy.block]: probe(formFieldAnatomy),
    [labelAnatomy.block]: probe(labelAnatomy),
    [hintAnatomy.block]: probe(hintAnatomy),
  },
});

export function strict(ui: ReactElement): ReactElement {
  return <StrictMode>{ui}</StrictMode>;
}

/** The FormField story markup: a label, a native input and two hints. */
export function Field(): ReactElement {
  return (
    <FormField
      label={<Label htmlFor="email">Email address</Label>}
      hint={
        <>
          <Hint id="email-hint">We only use it for the receipt.</Hint>
          <Hint id="email-hint-2">No spam.</Hint>
        </>
      }
    >
      <input id="email" type="email" aria-describedby="email-hint email-hint-2" />
    </FormField>
  );
}
