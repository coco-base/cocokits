import { FormEvent } from "react";

import { FormField, Input } from "@cocokits/react-form-field";

import { StoryControlChangeEvent } from "./story-control.model";
import { StyledControlLabel, StyledControlSelection } from "./story-control.style";
import { AddonParametersControlNumber } from "../../model/addon.model";


interface StoryControlNumberProps {
  control: AddonParametersControlNumber;
  value: number;
  onChange: (changes: StoryControlChangeEvent) => void;
}

export function StoryControlNumber({control, value, onChange}: StoryControlNumberProps) {

  const onInput = (e: FormEvent<HTMLInputElement>) => {
    onChange({ [control.storyArgKey]: Number(e.currentTarget.value) });
  };

  return (
    <>
      <StyledControlLabel>{control.displayName}</StyledControlLabel>
      <StyledControlSelection>
        <FormField>
          <Input
            value={value}
            type="number"
            onInput={onInput}/>
        </FormField>
      </StyledControlSelection>
    </>
  );
  
}