import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/form-field/trailing-copy.config';
import { FormField, Hint, Input, Label, SvgIcon, Trailing } from '@cocokits/react-components';
import { useEffect, useState } from 'react';

export function TrailingCopy(props: { cckExampleArgs: ExampleArgs }) {

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
