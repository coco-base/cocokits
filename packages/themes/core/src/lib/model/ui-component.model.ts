export type UIComponentsName = 'button' | 'svgIcon';

export type UIComponentsPropName = 'type' | 'color' | 'size';

export type ThemeUIComponentPropValue = string;
export type ThemeUIComponentProps = Partial<Record<UIComponentsPropName, ThemeUIComponentPropValue | null>>;
export type ThemeUIComponentConfig = Record<UIComponentsPropName, ThemeUIComponentPropsConfig | null>;

export interface ThemeUIComponentPropsConfig {
  name: UIComponentsPropName;
  values: ThemeUIComponentPropValue[];
  require: boolean; // If true, the 'default' must be null
  default: ThemeUIComponentPropValue | null;
  description: string;
  selectorRenderer?: (prefix: string, value: string) => string; // Default values is defined here: `packages/themes/core/src/lib/class-names/css-selector-render.ts`
}

export type ThemeUIComponentsConfig = Record<UIComponentsName, ThemeUIComponentConfig>;

// TODO: Find a better name
export interface ThemeUIComponentsOptions {
  componentName: UIComponentsName;
  componentProps: ThemeUIComponentProps;
  uiComponentsConfig: ThemeUIComponentsConfig;
}
