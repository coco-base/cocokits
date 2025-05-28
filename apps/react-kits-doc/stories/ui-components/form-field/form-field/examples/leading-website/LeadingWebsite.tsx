import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/leading-website.config';
import { FormField, Input, Label, Leading } from '@cocokits/react-components';

export function LeadingWebsite(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <FormField>
      <Label>Website URL</Label>
      <Leading>https://</Leading>
      <Input />
    </FormField>
  );
}
