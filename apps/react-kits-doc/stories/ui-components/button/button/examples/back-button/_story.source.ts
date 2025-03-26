/* eslint-disable @typescript-eslint/no-unused-vars */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source')

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'BackButton.tsx',
    code: `
import { Icons } from '@cocokits/common-icons';

import { Button, SvgIcon } from '@cocokits/react-components';

export function BackButton(props: {cckExampleArgs: ExampleArgs}) {

  return (
    <Button>
      <SvgIcon icon={Icons.arrowLeft} />
      <span>Back</span>
    </Button>
  );
}
`,
  },
];
