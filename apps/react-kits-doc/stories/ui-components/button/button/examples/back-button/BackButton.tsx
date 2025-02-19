import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/button/back-button.config';
import { Button, SvgIcon } from '@cocokits/react-components';

export function BackButton(props: {cckExampleArgs: ExampleArgs}) {

  return (
    <Button>
      <SvgIcon icon={Icons.arrowLeft} />
      <span>Back</span>
    </Button>
  );
}
