import { CckToggleChange, Toggle } from "@cocokits/react-toggle";

import { StoryControlChangeEvent } from "./story-control.model";
import { StyledControlLabel, StyledControlSelection } from "./story-control.style";
import { AddonParametersControlBoolean } from "../../model/addon.model";


interface StoryControlBooleanProps {
  control: AddonParametersControlBoolean;
  checked: boolean;
  onChange: (changes: StoryControlChangeEvent) => void;
}

export function StoryControlBoolean({control, checked, onChange}: StoryControlBooleanProps) {

  const onToggleChange = (e: CckToggleChange) => {
    onChange({ [control.storyArgKey]: e.checked });
  };

  return (
    <>
      <StyledControlLabel>{control.displayName}</StyledControlLabel>
      <StyledControlSelection>
        <Toggle checked={checked} onChange={onToggleChange}/>
      </StyledControlSelection>
    </>
  );
  
}