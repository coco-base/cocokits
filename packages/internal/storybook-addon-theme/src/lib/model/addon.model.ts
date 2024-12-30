import { DeepPartial, ThemeComponentConfig, UIBaseComponentsName, UIBaseComponentsPropName } from '@cocokits/core';
import { IconsName } from '../utils/icons';
import { Args, PreparedStory } from '@storybook/types';
import { ThemeChangeEvent } from './event.model';
import { StoryTab } from '../features/story-doc-page/story-doc-page';

/**
 * Configuration interface for the CocoKits Storybook Addon Theme.
 */
export interface StorybookAddonThemeConfig {
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
}

export type AddonParameters = AddonParametersMeta & AddonParametersStories;

export interface AddonParametersStories {
  docs?: {
    // required
    description?: {
      // required
      story?: string; // required
    };
    source?: any;
  };
  cckAddon?: CckAddonStories; // required
}

export interface AddonParametersMeta {
  docs?: {
    // <---- required
    description?: {
      // <---- required
      component?: string; // <---- required
    };
    source?: any;
    // Will be added by compodoc after rendered
    readonly extractArgTypes?: (component: any) => PreparedStory['argTypes'];
  };
  cckAddon?: CckAddonStoriesMeta; // <---- required
}

export interface CckAddonStoriesMeta {
  componentName?: UIBaseComponentsName; // <---- required
  /**
   * Will be use to detect the themeConfig for an component to generate API table.
   */
  subcomponentNames?: Record<string, UIBaseComponentsName>;
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
  source?: AddonParametersSource[]; // <---- required
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
  | AddonParametersControlBoolean
  | AddonParametersControlTheme;

export enum AddonParametersControlType {
  Select = 'select',
  Boolean = 'boolean',
  Text = 'text',
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
  options: string[];
  default: string;
}

export interface AddonParametersControlText extends AddonParametersControlBase {
  type: AddonParametersControlType.Text;
  default: string;
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
