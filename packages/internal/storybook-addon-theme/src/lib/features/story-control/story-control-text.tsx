import { FormEvent } from "react";

import { FormField, Input } from "@cocokits/react-form-field";

import { StoryControlChangeEvent } from "./story-control.model";
import { StyledControlLabel, StyledControlSelection } from "./story-control.style";
import { AddonParametersControlText } from "../../model/addon.model";


interface StoryControlTextProps {
  control: AddonParametersControlText;
  value: string;
  onChange: (changes: StoryControlChangeEvent) => void;
}

export function StoryControlText({control, value, onChange}: StoryControlTextProps) {

  const onInput = (e: FormEvent<HTMLInputElement>) => {
    onChange({ [control.storyArgKey]: e.currentTarget.value });
  };

  return (
    <>
      <StyledControlLabel>{control.displayName}</StyledControlLabel>
      <StyledControlSelection>
        <FormField>
          <Input
            value={value}
            onInput={onInput}/>
        </FormField>
      </StyledControlSelection>
    </>
  );
  
}