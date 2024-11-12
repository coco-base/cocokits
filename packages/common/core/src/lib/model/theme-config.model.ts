import { ThemeSvgIcon } from './theme-svg-icon.model';

export type UIBaseComponentsName =
  // form-field
  | 'formField'
  | 'label'
  | 'error'
  | 'hint'
  | 'prefix'
  | 'suffix'
  | 'trailing'
  | 'leading'
  | 'input'
  | 'textarea'
  | 'select'
  | 'option'
  | 'optionGroup'
  | 'selectPreview'
  | 'chip'
  | 'chipList'

  // menu
  | 'menu'
  | 'menuItem'

  // divider
  | 'divider'

  // toggle
  | 'toggle'

  // radio
  | 'radioButton'
  | 'radioGroup'

  // checkbox
  | 'checkbox'

  // button
  | 'button'
  | 'iconButton'

  // icon
  | 'svgIcon';

export type UIBaseComponentsPropName = 'type' | 'color' | 'size';
export type UIBaseComponentsPropValue = string | number | boolean | null; // When null, no specific value is applied, event default value

export interface UIBaseComponentProps {
  type?: UIBaseComponentsPropValue;
  color?: UIBaseComponentsPropValue;
  size?: UIBaseComponentsPropValue;
  additional?: Record<string, UIBaseComponentsPropValue>;
}

export interface ThemeComponentConfig {
  type?: ThemeComponentPropertyConfig;
  color?: ThemeComponentPropertyConfig;
  size?: ThemeComponentPropertyConfig;
  additional?: Record<string, ThemeComponentPropertyConfig>;
  templates?: {
    checkboxCheckmark?: string; // Optional
    radioCheckmark?: string; // Optional
    dropdownIcon?: ThemeSvgIcon; // Require
    optionSelectedIcon?: ThemeSvgIcon; // Optional
    chipRemoveIcon?: ThemeSvgIcon; // Require
  };
}

export interface ThemeComponentPropertyConfig {
  name: UIBaseComponentsPropName | string; // additional properties can have any name
  values: NonNullable<UIBaseComponentsPropValue>[];
  default: NonNullable<UIBaseComponentsPropValue>;
  description: string;
}

export interface ThemeConfig {
  components: ThemeComponentConfigRecord;

  /**
   * The prefix to use for CSS selectors.
   * This is useful when you have multiple themes in the same project.
   * For example, if you want to use the button component in both the Storybook documentation page and in the stories,
   * the Storybook documentation page must have a prefix. Otherwise, you will have two components with two different themes,
   * but the browser will only apply one of them.
   */
  cssSelectorPrefix: string;
}
export type ThemeComponentConfigRecord = Record<UIBaseComponentsName, ThemeComponentConfig>;

export interface CssSelectorGeneratorOptions {
  componentName: UIBaseComponentsName;
  componentProps: UIBaseComponentProps;
  themeConfig: ThemeConfig;
}
