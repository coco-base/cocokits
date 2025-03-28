import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/checkbox/checkbox-label-link.config';
import { Checkbox } from '@cocokits/react-checkbox';

export function CheckboxLabelLink(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <Checkbox>
      I accept the <a href="/">Privacy Policy</a>
    </Checkbox>
  );
}
