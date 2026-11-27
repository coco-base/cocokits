import type { ReactElement } from 'react';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { Radio } from '../../radio';
import { Switch } from '../../switch';
import { Checkbox } from '../index';

/** The app both the server and the client render: every control, alone and in a field, with every state. */
export function ChoiceApp(): ReactElement {
  return (
    <>
      <FormField id="news" required label={<Label>Newsletter</Label>} hint={<Hint>Weekly only.</Hint>}>
        <Checkbox defaultChecked name="news" value="yes">
          Email me
        </Checkbox>
      </FormField>
      <FormField id="push" label={<Label>Push</Label>}>
        <Switch name="push">Notify me</Switch>
      </FormField>
      <Checkbox id="mixed" indeterminate aria-describedby="note">
        All
      </Checkbox>
      <Checkbox disabled>Disabled</Checkbox>
      <Checkbox readOnly checked>
        Read-only
      </Checkbox>
      <Switch defaultChecked required>
        On
      </Switch>
      <fieldset>
        <legend>Plan</legend>
        <Radio name="plan" value="free" defaultChecked>
          Free
        </Radio>
        <Radio name="plan" value="pro">
          Pro
        </Radio>
      </fieldset>
      <p id="note">A note</p>
    </>
  );
}
