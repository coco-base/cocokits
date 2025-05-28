import { PreparedStory } from '@storybook/types';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getInstance, hasNotValue } from '@cocokits/common-utils';
import { FormField, Option, Select, SelectPreview } from '@cocokits/react-form-field';

import { StoryControlStore } from './preview-story-args.store';
import { AddonParameters, AddonParametersControlSelect, AddonParametersControlType } from '../../model/addon.model';
import { useTheme } from '../../utils/use-preview-theme';

interface StorySingleControlProps {
  argName: string;
  story: PreparedStory;
}

export function StorySingleControl({ story, argName }: StorySingleControlProps) {
  const theme = useTheme();
  const storyControlStore = getInstance(StoryControlStore);
  const [selectedValue, setSelectedValue] = useState<string>();
  const [control, setControl] = useState<AddonParametersControlSelect>();

  useEffect(() => {
    const subscription = storyControlStore.getState$(story.id).subscribe((state) => {
      const parameters = story.parameters as AddonParameters;
      const themeComponentConfig = theme.themeConfig.components[parameters.cckAddon.componentName];

      if (!themeComponentConfig || !(argName in themeComponentConfig)) {
        setControl(undefined);
        setSelectedValue(undefined);
        return;
      }

      const targetControl = state.controls.find((_control) => _control.storyArgKey === argName);
      const value = state.args[argName] as string;

      if (!targetControl) {
        throw new Error(`CckControl not found for story ID: ${story.id} and arg name: ${argName}`);
      }

      if (targetControl.type !== AddonParametersControlType.Select) {
        throw new Error(
          `singleControls accept only Select control type, but got ${targetControl.type} for story ID: ${story.id} and arg name: ${argName}`
        );
      }

      if (hasNotValue(value)) {
        throw new Error(
          `The argument '${argName}' does not exist in the CckControls configuration for story ID '${story.id}'.`
        );
      }

      setControl(targetControl);
      setSelectedValue(value);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [story, theme.id]);

  if (!control || !selectedValue) {
    return;
  }

  const onSelectValueChange = (selectedValues: string[]) => {
    storyControlStore.updateStoryArgs(story.id, { [argName]: selectedValues[0] });
  };

  const CustomSelectPreview = () => (
    <SelectPreview>
      <StyledSelectPreviewType>{control.displayName}</StyledSelectPreviewType>
      {selectedValue}
    </SelectPreview>
  );

  return (
    <StyledFormField>
      <Select selectPreview={CustomSelectPreview} value={selectedValue} onChange={onSelectValueChange}>
        {control.options.map((value, index) => (
          <Option value={value} key={index}>
            {value}
          </Option>
        ))}
      </Select>
    </StyledFormField>
  );
}

const StyledFormField = styled(FormField)`
  min-width: 150px;
`;

const StyledSelectPreviewType = styled.span`
  font: var(--cck-doc-text-sm-regular);
  color: var(--cck-doc-color-font-3);
  margin-right: 8px;
`;
