import { Icons } from '@cocokits/common-icons';
import { SvgIcon } from '@cocokits/react-icon';
import { Tab, TabLabel, Tabs, TabSelectionChangeEvent } from '@cocokits/react-tabs';

import { StoryControlChangeEvent } from './story-control.model';
import { StyledControlLabel } from './story-control.style';
import { AddonParametersControlIcon } from '../../model/addon.model';

interface StoryControlIconProps {
  control: AddonParametersControlIcon;
  selected: string;
  onChange: (changes: StoryControlChangeEvent) => void;
}

export function StoryControlIcon({ control, selected, onChange }: StoryControlIconProps) {
  const onIconChange = (e: TabSelectionChangeEvent) => {
    onChange({ [control.storyArgKey]: e.value });
  };

  return (
    <>
      <StyledControlLabel>{control.displayName}</StyledControlLabel>
      <Tabs color="h-contrast" size="fit" selectedValue={selected} onSelectionChange={onIconChange} hideContent={true}>
        {control.icons.map((icon) => (
          <Tab
            key={icon}
            value={icon}
            label={() => (
              <TabLabel>
                <SvgIcon icon={Icons[icon]} />
              </TabLabel>
            )}></Tab>
        ))}
      </Tabs>
    </>
  );
}
