/* eslint-disable */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source')

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'CopyLinkButton.tsx',
    code: `
import { Icons } from '@cocokits/common-icons';

import { Button, SvgIcon } from '@cocokits/react-components';

export function CopyLinkButton() {
  return (
    <Button type='<%= buttonType %>'>
      <SvgIcon icon={Icons.link} />
      <span>Copy Link</span>
    </Button>
  );
}
`,
  },
];
