/* eslint-disable @typescript-eslint/no-unused-vars */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Tue Mar 25 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'DeleteButton.tsx',
    code: `
import { OutlineIcons } from '@cocokits/common-icons';

import { Button, SvgIcon } from '@cocokits/react-components';

export function DeleteButton(props: {cckExampleArgs: ExampleArgs}) {

  return (
    <Button color='<%= buttonColor %>' type='<%= buttonType %>'>  
      <SvgIcon icon={OutlineIcons.trash}/>
      <span>Delete</span>
    </Button>
  );
}
`,
  },
];
