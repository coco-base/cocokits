export type Markdown = string;
export type CssSelectorName = string; // e.g. '.cck-icon__size--xs'
export type CssSelectorComponent = string; // e.g: 'overlay' or 'button'
export type CssSelectorVariant = string; // e.g: `Size` or `Color`
export type CssSelectorProperty = string; // e.g. 'color'

export type CssSelectorVariantMap = Record<CssSelectorName, ThemeStyleValidation>;
export type CssSelectorComponentMap = Record<CssSelectorVariant, CssSelectorVariantMap>;

/**
 * TODO: Maybe we can add also the following data:
 * - Example Usage: Code snippets or examples showing how the selector is used in HTML.
 * - Default Values: The default CSS values assigned to these properties (if any).
 * - Related Selectors: Other CSS selectors that are related or commonly used together.
 * - Dependencies: Any dependencies or prerequisites for using this selector.
 * - Components: The UI components that use this selector.
 * - Notes: Additional notes or tips for designers when implementing this selector.
 */
export interface ThemeStyleValidation {
  /**
   * The specific class or ID selector used in the UI component.
   */
  selector: CssSelectorName;

  /**
   * A list of CSS properties that should be defined for this selector in the theme.
   */
  properties: CssSelectorProperty[];

  /**
   * A brief explanation of what the selector does or represents.
   */
  description: Markdown;

  /**
   * Scenarios or contexts where this selector is typically applied.
   */
  renderCondition: Markdown;
}
