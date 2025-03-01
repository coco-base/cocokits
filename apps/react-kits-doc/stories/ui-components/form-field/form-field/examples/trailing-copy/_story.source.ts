// (Do not edit directly)
// (Auto generated by the Cocokits 'generate-example-story-source' on Sat Mar 01 2025

import { AddonParametersSource, ThemeId } from '@cocokits/storybook-addon-theme';

export const SOURCE: AddonParametersSource[] = [
  {
    language: 'tsx',
    filename: 'TrailingCopy.tsx',
    code: `
import { Icons } from '@cocokits/common-icons';

import { FormField, Hint, Input, Label, SvgIcon, Trailing } from '@cocokits/react-components';
import { useEffect, useState } from 'react';

export function TrailingCopy() {

  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    let setTimeoutId: NodeJS.Timeout;
    if(showHint) {
      setTimeoutId = setTimeout(() => {
        setShowHint(false);
      }, 3000);
    }

    return () => {
      clearTimeout(setTimeoutId);
    };

  }, [showHint]);

  return (
    <FormField>
      <Label>Copy text</Label>
      <Input defaultValue="cocokits.com"></Input>
      <Trailing clickable={true} onClick={() => setShowHint(true)}>
        <SvgIcon icon={Icons.copy}/>
      </Trailing>
      {showHint && <Hint>Copied</Hint>}
    </FormField>
  );
}
`,
  },
];
