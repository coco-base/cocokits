// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Thu Feb 20 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'AddNewButton.tsx',
    code: `
import { Icons } from '@cocokits/common-icons';

import { Button, SvgIcon } from '@cocokits/react-components';

export function AddNewButton() {
  return (
    <Button type='<%= buttonType %>' color='<%= buttonColor %>' size='<%= buttonSize %>'>
      <span>Add New</span>
      <SvgIcon icon={Icons.plus} />
    </Button>
  );
}
`,
  },
];
