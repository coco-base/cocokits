import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/button/add-new-button.config';
import { Button, SvgIcon } from '@cocokits/react-components';

export function AddNewButton(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <Button
      type={props.cckExampleArgs.buttonType}
      color={props.cckExampleArgs.buttonColor}
      size={props.cckExampleArgs.buttonSize}>
      <span>Add New</span>
      <SvgIcon icon={Icons.plus} />
    </Button>
  );
}
