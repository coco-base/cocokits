import { UIBaseComponentsName } from '@cocokits/core';
import { IconsName } from '../utils/icons';
import { Args } from '@storybook/types';

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

export interface AddonParameters {
  docs?: {
    description?: {
      story?: string;
      component?: string;
    };
    source?: any; // TODO: Remove it after all stories are updated base on new doc theme
  };
  cckAddon?: {
    componentName?: UIBaseComponentsName;
    source?: AddonParametersSource[];
    hasControl?: boolean;
    hasStackblitz?: boolean;
    hasCode?: boolean;
    singleControls?: string[]; // Args key, such as 'type', 'color', 'size'
    controls?: AddonParametersControl[];
  };
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
  code: string;
}

export type AddonParametersControl =
  | AddonParametersControlTab
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

export interface AddonParametersControlTab extends AddonParametersControlBase {
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
