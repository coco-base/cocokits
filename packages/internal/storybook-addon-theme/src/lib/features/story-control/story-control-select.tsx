import { FormField, Option, Select } from '@cocokits/react-form-field';

import { StoryControlChangeEvent } from './story-control.model';
import { StyledControlLabel, StyledControlSelection } from './story-control.style';
import { AddonParametersControlSelect } from '../../model/addon.model';

export interface StoryControlSelectProps {
  control: AddonParametersControlSelect;
  value: string;
  onChange: (changes: StoryControlChangeEvent) => void;
}

export function StoryControlSelect({ control, value, onChange }: StoryControlSelectProps) {
  const onSelectChange = (selectedValue: string[]) => {
    onChange({ [control.storyArgKey]: selectedValue[0] });
  };

  return (
    <>
      <StyledControlLabel>{control.displayName}</StyledControlLabel>
      <StyledControlSelection>
        <FormField>
          <Select onChange={onSelectChange} value={value}>
            {control.options.map((option) => (
              <Option key={option} value={option}>{option}</Option>
            ))}
          </Select>
        </FormField>
      </StyledControlSelection>
    </>
  );
}
