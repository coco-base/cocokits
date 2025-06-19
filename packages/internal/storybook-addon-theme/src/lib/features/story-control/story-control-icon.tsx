import { Icons } from '@cocokits/common-icons';
import { SvgIcon } from '@cocokits/react-icon';
import { TabLabelOld, TabOld, TabSelectionChangeEventOld, TabsOld } from '@cocokits/react-tabs-old';

import { StoryControlChangeEvent } from './story-control.model';
import { StyledControlLabel } from './story-control.style';
import { AddonParametersControlIcon } from '../../model/addon.model';

interface StoryControlIconProps {
  control: AddonParametersControlIcon;
  selected: string;
  onChange: (changes: StoryControlChangeEvent) => void;
}

export function StoryControlIcon({ control, selected, onChange }: StoryControlIconProps) {
  const onIconChange = (e: TabSelectionChangeEventOld) => {
    onChange({ [control.storyArgKey]: e.value });
  };

  return (
    <>
      <StyledControlLabel>{control.displayName}</StyledControlLabel>
      <TabsOld color="h-contrast" size="fit" selectedValue={selected} onSelectionChange={onIconChange} hideContent={true}>
        {control.icons.map((icon) => (
          <TabOld
            key={icon}
            value={icon}
            label={() => (
              <TabLabelOld>
                <SvgIcon icon={Icons[icon]} />
              </TabLabelOld>
            )}></TabOld>
        ))}
      </TabsOld>
    </>
  );
}
