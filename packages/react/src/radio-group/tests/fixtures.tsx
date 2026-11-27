import { StrictMode, type ReactElement } from 'react';
import { Radio } from '../../radio';
import { RadioGroup, type RadioGroupProps } from '../index';

/** Three radios in a group, the second one optionally disabled, between two buttons of the page. */
export function Example({ lockPro = false, ...group }: RadioGroupProps & { readonly lockPro?: boolean }): ReactElement {
  return (
    <StrictMode>
      <button>before</button>
      <RadioGroup aria-label="Plan" {...group}>
        <Radio value="free">Free</Radio>
        <Radio value="pro" disabled={lockPro}>
          Pro
        </Radio>
        <Radio value="team">Team</Radio>
      </RadioGroup>
      <button>after</button>
    </StrictMode>
  );
}
