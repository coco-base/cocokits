import { Icons } from '@cocokits/common-icons';
import { ExampleArgs } from '@cocokits/common-kits-doc/examples-config/button/show-more-button.config';
import { Button, SvgIcon } from '@cocokits/react-components';

export function ShowMoreButton(props: { cckExampleArgs: ExampleArgs }) {
  return (
    <Button type={props.cckExampleArgs.buttonType} color={props.cckExampleArgs.buttonColor}>
      <span>Show More</span>
      <SvgIcon icon={Icons.arrowHeadDown} />
    </Button>
  );
}
