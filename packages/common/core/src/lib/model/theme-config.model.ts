import { RequireAtLeastOne } from './common.model';
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
  | 'svgIcon'

  // tabs
  | 'tabs'
  | 'tab'
  | 'tabLabel'

  // Overlay
  | 'overlay';

export type UIBaseComponentsPropName = 'type' | 'color' | 'size';
export type UIBaseComponentsPropValue = string | number | boolean | null; // When null, no specific value is applied, event default value

export interface UIBaseComponentProps {
  /**
   * TODO: Add description
   */
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

/**
 * The record of component names and their configurations.
 * If a component has not been defined in this interface from your theme config, it means that the theme does not support that component.
 * If the component has been defined, but the configuration is empty, it means that the theme supports the component but the component has no specific configuration (such as type, color, or size).
 */
export type ThemeComponentConfigRecord = Partial<Record<UIBaseComponentsName, ThemeComponentConfig>>;

export interface CssSelectorGeneratorOptions {
  componentName: UIBaseComponentsName;
  componentProps: UIBaseComponentProps;
  themeConfig: ThemeConfig;
}

export interface LayoutElementClassNamesConfig {
  // TODO: add name property that contains the key selector name (i.e. 'host', 'backdrop')
  name: string; // TODO: Rename it to elementName
  selectorStructure: RequireAtLeastOne<{
    block?: string;
    element?: string;
    modifier?: string;
  }>[];
  description: string;
}

export interface LayoutClassNamesConfig {
  componentName: UIBaseComponentsName;
  /**
   * The base selector structure which will be added to the final CSS class before all elements' selector structures.
   * For example, if the base selector structure is `{ block: 'button', element: 'my-prefix' }`, and element selector structure is `{ element: 'icon' }`,
   * then the final CSS class will be `button__my-prefix-icon`.
   */
  baseSelectorStructure: RequireAtLeastOne<{
    block?: string;
    element?: string;
    modifier?: string;
  }>;
  elements: { host: LayoutElementClassNamesConfig } & Record<string, LayoutElementClassNamesConfig>;
}
