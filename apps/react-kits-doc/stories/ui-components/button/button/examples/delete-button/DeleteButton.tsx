import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/button/delete-button.config';
import { Button, SvgIcon } from '@cocokits/react-components';

export function DeleteButton(props: {cckExampleArgs: ExampleArgs}) {

  return (
    <Button color={props.cckExampleArgs.buttonColor} type={props.cckExampleArgs.buttonType}>  
      <SvgIcon icon={Icons.trashOutline}/>
      <span>Delete</span>
    </Button>
  );
}
