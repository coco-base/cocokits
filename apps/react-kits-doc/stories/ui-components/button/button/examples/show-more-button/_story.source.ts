// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Thu Feb 27 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'ShowMoreButton.tsx',
    code: `
import { Icons } from '@cocokits/common-icons';

import { Button, SvgIcon } from '@cocokits/react-components';

export function ShowMoreButton() {
  return (
    <Button type='<%= buttonType %>' color='<%= buttonColor %>'>
      <span>Show More</span>
      <SvgIcon icon={Icons.arrowHeadDown} />
    </Button>
  );
}
`,
  },
];
