import { Icons } from '@cocokits/common-icons';
import { Button } from '@cocokits/react-button';
import { SvgIcon } from '@cocokits/react-icon';

interface StorySourceCodeButtonProps {
  selected: boolean;
  onCodeClick: () => void;
}

export function StorySourceCodeButton({ selected, onCodeClick }: StorySourceCodeButtonProps) {
  return (
    <Button type={selected ? 'light' : 'basic'} onClick={() => onCodeClick()}>
      <SvgIcon icon={Icons.code} />
      Code
    </Button>
  );
}
