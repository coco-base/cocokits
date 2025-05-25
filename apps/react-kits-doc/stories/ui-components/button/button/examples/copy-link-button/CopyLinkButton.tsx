import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/button/copy-link-button.config';
import { Button, SvgIcon } from '@cocokits/react-components';

export function CopyLinkButton(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <Button type={props.cckExampleArgs.buttonType}>
      <SvgIcon icon={Icons.link} />
      <span>Copy Link</span>
    </Button>
  );
}
