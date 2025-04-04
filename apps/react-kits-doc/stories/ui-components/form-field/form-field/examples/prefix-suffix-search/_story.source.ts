/* eslint-disable */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source')

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'PrefixSuffixSearch.tsx',
    code: `
import { Icons } from '@cocokits/common-icons';

import { FormField, Input, Prefix, Suffix, SvgIcon } from '@cocokits/react-components';

export function PrefixSuffixSearch() {
  return (
    <FormField>
      <Input placeholder="Search ..." />
      <Prefix>
        <SvgIcon size='<%= iconSize %>' icon={Icons.search}></SvgIcon>
      </Prefix>
      <Suffix>
        <SvgIcon size='<%= iconSize %>' icon={Icons.mic}></SvgIcon>
      </Suffix>
    </FormField>
  );
}
`,
  },
];
