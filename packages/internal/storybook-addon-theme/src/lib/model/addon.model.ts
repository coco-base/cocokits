import { Args, PreparedStory } from '@storybook/types';
import { ComponentType } from 'react';

import { ClassRef, DeepPartial, ThemeComponentConfig, UIBaseComponentsName } from '@cocokits/core';

import { ThemeChangeEvent } from './event.model';
import { StoryTab } from '../features/story-doc-page/story-doc-page';
import { IconsName } from '../utils/icons';

/**
 * Configuration interface for the CocoKits Storybook Addon Theme.
 */
export interface AddonThemeConfig {
  /**
   * Configuration for Mixpanel analytics.
   */
  mixpanel?: {
    /**
     * Development token for Mixpanel.
     */
    devToken: string;
    /**
     * Production token for Mixpanel.
     */
    prodToken: string;
  };
  /**
   * Flag to hide the toolbar in Storybook.
   * Use this option for documentation projects only. Enabling this flag will hide the toolbar in all stories, including development stories used for testing components.
   */
  hideToolbar?: boolean;

  framework: 'angular' | 'react';
}

export type AddonParameters = AddonParametersMeta & AddonParametersStories;

export interface AddonParametersStories {
  docs: {
    description: {
      story: string;
    };
  };
  cckAddon: CckAddonStories;
}

export interface AddonParametersMeta {
  docs: {
    description: {
      component: string;
    };
    // Will be added by compodoc after rendered
    readonly extractArgTypes?: (component: any) => PreparedStory['argTypes'];
  };
  cckAddon: CckAddonStoriesMeta;
}

export interface CckAddonStoriesMeta {
  componentName: UIBaseComponentsName;
  /**
   * Will be use to detect the themeConfig for an component to generate API table.
   * If the value of a subComponent is null, means it's not part of themes and we will skip it from styling tab,
   * and for API tab we will only show the API of the component.
   */
  subcomponentNames?: Record<string, UIBaseComponentsName | null>;
  /**
   * Override the default argTypes for the story.
   * Can be used to override the subcomponent argsType.
   * Angular storybook has no ways to get the subcomponent argTypes. and it use compoDoc to get the argTypes.
   * ```
   * const resolved = useOf('meta');
   * const subComponentArgType = resolved.preparedMeta.parameters['docs'].extractArgTypes(resolved.preparedMeta.subcomponent[0]);
   * ```
   *
   * overrideArgsType will merge the subcomponent argTypes with the overrideArgsType.
   * The key is component name and the value is the argTypes.
   */
  subcomponentArgsTypes?: Record<string, DeepPartial<PreparedStory['argTypes']>>;
}

export interface StoryRenderConditionProps {
  theme: ThemeChangeEvent;
  themeComponentConfig: ThemeComponentConfig | undefined; // Not all themes have the target component config
  docPageTab: StoryTab;
}

export interface CckAddonStories {
  renderConditions?: ((props: StoryRenderConditionProps) => boolean)[];
  source?: AddonParametersSource[];
  /**
   * @default false
   */
  hasControl?: boolean;
  /**
   * @default false
   */
  hasStackblitz?: boolean;
  /**
   * @default true
   */
  hasCode?: boolean;
  /**
   * Args key, such as 'type', 'color', 'size'
   */
  singleControls?: string[];
  controls?: AddonParametersControl[];
  // stackblitz?: {
  //   framework?: 'angular';
  //   title?: string;
  //   tsFile?: string;
  //   extraFiles?: Record<string, string>;
  // };
}

export type AddonSourceCodeLanguages =
  | 'angular-html'
  | 'angular-ts'
  | 'html'
  | 'javascript'
  | 'json'
  | 'scss'
  | 'shellscript'
  | 'typescript';

export interface AddonParametersSource {
  language: AddonSourceCodeLanguages;
  filename: string;
  /**
   * We use 'ejs' to parse the source code and replace the variables.
   * available variables are:
   * - cckAddon control args
   * - themeId
   * - themeDisplayName
   * - themeSelectedModes
   * - themeComponentConfig
   *
   * After that we use prettier to format the code.
   * At the end use shiki to highlight the code.
   */
  code: string;
}

export type AddonParametersControl =
  | AddonParametersControlIcon
  | AddonParametersControlSelect
  | AddonParametersControlText
  | AddonParametersControlNumber
  | AddonParametersControlBoolean
  | AddonParametersControlTheme;

export enum AddonParametersControlType {
  Select = 'select',
  Boolean = 'boolean',
  Text = 'text',
  Number = 'number',
  Icon = 'icon',
  SelectThemeConfig = 'select-theme-config',
}
export interface AddonParametersControlBase {
  type: AddonParametersControlType;
  storyArgKey: string;
  displayName: string;
}

export interface AddonParametersControlIcon extends AddonParametersControlBase {
  type: AddonParametersControlType.Icon;
  icons: IconsName[];
  default: IconsName;
}

export interface AddonParametersControlSelect extends AddonParametersControlBase {
  type: AddonParametersControlType.Select;
  options: (string | null)[];
  default: string;
}

export interface AddonParametersControlText extends AddonParametersControlBase {
  type: AddonParametersControlType.Text;
  default: string;
}

export interface AddonParametersControlNumber extends AddonParametersControlBase {
  type: AddonParametersControlType.Number;
  default: number;
}

export interface AddonParametersControlBoolean extends AddonParametersControlBase {
  type: AddonParametersControlType.Boolean;
  default: boolean;
}

export interface AddonParametersControlTheme {
  type: AddonParametersControlType.SelectThemeConfig;
  prop: 'type' | 'color' | 'size' | 'additional';
}

export interface StoryArgs extends Args {
  cckControl?: Args;
}

export type ComponentRef = ClassRef | ComponentType<any>;
