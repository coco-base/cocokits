import { Args, PreparedStory } from '@storybook/types';
import { ComponentType } from 'react';

import { IconsName } from '@cocokits/common-icons';
import { ClassRef, DeepPartial } from '@cocokits/common-utils';
import { ThemeComponentConfig, UIBaseComponentsName } from '@cocokits/core';

import { ThemeChangeEvent } from './event.model';
import { ExampleStoryCssVariables, ExampleStoryTemplateArgs } from './theme.model';
import { StoryTab } from '../features/story-doc-page/story-doc-page';

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
  docs?: {
    description?: {
      story?: string;
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
  deception?: string;

  subcomponents?: Record<
    string,
    {
      /**
       * Will be use to detect the themeConfig for an component to generate API table.
       * If the value of a subComponent is null, means it's not part of themes and we will skip it from styling tab,
       * and for API tab we will only show the API of the component.
       */
      name: UIBaseComponentsName | null;

      /**
       * The short deception of sub component. can be string or markdown format
       */
      description?: string;

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
      argsTypes?: DeepPartial<PreparedStory['argTypes']>;
    }
  >;
  /**
   * Ref to markdown file of ng-template that will be used on his component.
   * If it's provided, the doc page show template section with the content of the markdown file.
   */
  ngTemplateMarkdown?: string;
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

  exampleStory?: {
    templateArgsMap: ExampleStoryTemplateArgs<unknown>;
    cssArgsMap: ExampleStoryCssVariables;
  };

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
  | 'typescript'
  | 'tsx';

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
  visibleConditions?: ((theme: ThemeChangeEvent) => boolean)[];
}

export type AddonParametersControl =
  | AddonParametersControlIcon
  | AddonParametersControlSelect
  | AddonParametersControlImage
  | AddonParametersControlText
  | AddonParametersControlNumber
  | AddonParametersControlBoolean
  | AddonParametersControlTheme;

export enum AddonParametersControlType {
  Select = 'select',
  Image = 'image',
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

export interface AddonParametersControlImage extends AddonParametersControlBase {
  type: AddonParametersControlType.Image;
  images: string[];
  default: string;
}

export interface AddonParametersControlText extends AddonParametersControlBase {
  type: AddonParametersControlType.Text;
  default: string | undefined;
}

export interface AddonParametersControlNumber extends AddonParametersControlBase {
  type: AddonParametersControlType.Number;
  default: number | undefined;
}

export interface AddonParametersControlBoolean extends AddonParametersControlBase {
  type: AddonParametersControlType.Boolean;
  default: boolean;
}

export interface AddonParametersControlTheme {
  type: AddonParametersControlType.SelectThemeConfig;
  prop: 'type' | 'color' | 'size' | 'additional';
  /**
   * If the control is for a sub-component, this will be the name of that sub-component.
   * For example `badgeContainer` has his own theme config and `badge` components sub-component that we use as content of badgeContainer.
   * */
  subComponentName?: UIBaseComponentsName;
}

export interface StoryArgs extends Args {
  cckControl?: Args;
  cckExampleArgs?: Args;
}

export type ComponentRef = (ClassRef | ComponentType<any>) & { displayName: string | undefined };
