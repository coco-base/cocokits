import { ThemeSvgIcon } from './theme-svg-icon.model';

export type UIComponentsName =
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

export type UIComponentsPropName = 'type' | 'color' | 'size';

export type ThemeUIComponentPropValue = string | number | boolean;
export type ThemeUIComponentProps = Partial<Record<UIComponentsPropName, ThemeUIComponentPropValue | null>> & {
  additional?: Record<string, ThemeUIComponentPropValue | null>;
};
export type ThemeUIComponentConfig = Record<UIComponentsPropName, ThemeUIComponentPropsConfig | null> & {
  additional?: Record<string, ThemeUIComponentPropsConfig>;
  component?: {
    checkboxCheckmark?: string; // Optional
    radioCheckmark?: string; // Optional
    dropdownIcon?: ThemeSvgIcon; // Require
    optionSelectedIcon?: ThemeSvgIcon; // Optional
    chipRemoveIcon?: ThemeSvgIcon; // Require
  };
};

export interface ThemeUIComponentPropsConfig {
  name: UIComponentsPropName | string;
  values: ThemeUIComponentPropValue[];
  require: boolean; // If true, the 'default' must be null
  default: ThemeUIComponentPropValue | null;
  description: string;
}

export type ThemeUIComponentsConfig = Record<UIComponentsName, ThemeUIComponentConfig>;

// TODO: Find a better name
export interface ThemeUIComponentsOptions {
  componentName: UIComponentsName;
  componentProps: ThemeUIComponentProps;
  uiComponentsConfig: ThemeUIComponentsConfig;
}
