/* eslint-disable */
// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source')

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'ModeToggle.tsx',
    code: `
import { useState } from 'react';

import { Icons } from '@cocokits/common-icons';

import { IconButton, SvgIcon } from '@cocokits/react-components';

export function ModeToggle() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <IconButton
      color='<%= color %>'
      type='<%= type %>'
      size='<%= size %>'
      onClick={() => setIsDark(!isDark)}>
      <SvgIcon icon={isDark ? Icons.light : Icons.dark} size='<%= iconSize %>'/>
    </IconButton>
  );
}
`,
  },
];
