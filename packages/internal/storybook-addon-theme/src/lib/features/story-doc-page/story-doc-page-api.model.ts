import { UIBaseComponentsPropValue } from '@cocokits/core';

export interface StoryDocPageArgTypes {
  componentName: string;
  argTypeGroup: StoryDocPageComponentArgTypeGroup | null;
}

export interface StoryDocPageComponentArgTypeGroup {
  props?: StoryDocPageComponentArgType[];
  events?: StoryDocPageComponentArgType[];
  methods?: StoryDocPageComponentArgType[];
}

export interface StoryDocPageComponentArgType {
  name: string;
  description: string | undefined;
  defaultValue?: UIBaseComponentsPropValue; // Available only for props
  type: string;
}
