// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Fri Feb 21 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'DeleteButton.tsx',
    code: `
import { Icons } from '@cocokits/common-icons';

import { Button, SvgIcon } from '@cocokits/react-components';

export function DeleteButton(props: {cckExampleArgs: ExampleArgs}) {

  return (
    <Button color='<%= buttonColor %>' type='<%= buttonType %>'>  
      <SvgIcon icon={Icons.trashOutline}/>
      <span>Delete</span>
    </Button>
  );
}
`,
  },
];
