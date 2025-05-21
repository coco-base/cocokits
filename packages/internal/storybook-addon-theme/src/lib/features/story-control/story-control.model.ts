import { Args, PreparedStory, StoryId } from '@storybook/types';

import { ThemeComponentConfig, UIBaseComponentsName } from '@cocokits/core';

import { AddonParametersControl, AddonParametersControlTheme } from '../../model/addon.model';

export type StroyControlType = 'boolean' | 'select' | 'text' | 'tab';

export interface StroyControlArgType {
  name: string;
  label: string;
  type: StroyControlType;
  value: string | number | boolean | undefined;
  options: (string | number | boolean)[];
}

// Example: { type: 'primary', color: 'warn' }
export type StoryControlChangeEvent = Record<string, string | boolean | number | null>;

export interface StroyControlFieldProps {
  argType: StroyControlArgType;
  onChange: (changes: StoryControlChangeEvent) => void;
}

export interface StoreState {
  storyId: StoryId;
  story: PreparedStory;
  controls: Exclude<AddonParametersControl, AddonParametersControlTheme>[];
  args: Args & { themeComponentConfig: ThemeComponentConfig };
  componentName: UIBaseComponentsName;
}
