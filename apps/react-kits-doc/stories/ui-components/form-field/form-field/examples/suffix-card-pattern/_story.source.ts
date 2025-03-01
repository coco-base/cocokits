// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Sat Mar 01 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'SuffixCardPattern.tsx',
    code: `
import InputMask from '@mona-health/react-input-mask';

import { Icons } from '@cocokits/common-icons';

import { FormField, Input,Label, Suffix, SvgIcon } from '@cocokits/react-components';

export function SuffixCardPattern() {
  return (
    <FormField>
      <Label>Card information</Label>
      <InputMask mask="9999 9999 9999 9999" maskPlaceholder={null}>
        <Input/>
      </InputMask>
      <Suffix>
        <SvgIcon icon={Icons.card}/>
      </Suffix>
    </FormField>
  );
}
`,
  },
];
