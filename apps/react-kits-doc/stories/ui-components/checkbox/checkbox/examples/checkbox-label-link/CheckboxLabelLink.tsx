import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-label-link.config';
import { Checkbox } from '@cocokits/react-components';

export function CheckboxLabelLink(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <Checkbox value={1}>
      I accept the
      <a href="https://cocokits.com" target="_blank" rel="noopener noreferrer">
        Privacy Policy
      </a>
    </Checkbox>
  );
}
