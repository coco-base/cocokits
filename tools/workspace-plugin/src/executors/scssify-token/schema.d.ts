import { ScssifyTokenParser } from './model';
import { DesignTokenType } from './token.model';

export interface ScssifyTokenExecutorSchema {
  /**
   * The path to the JSON file containing the design tokens.
   * This path is used to locate and read the design tokens that will be converted into SCSS variables.
   *
   */
  files: string[];

  /**
   * Specifies the patterns or directories to exclude from the token conversion process.
   * This helps to ignore certain files or directories that are not needed in the SCSS output.
   */
  exclude: string[];

  /**
   * Specifies the types of design tokens to exclude from conversion.
   * This allows customization of which token types to process or ignore.
   */
  skipTokenTypes: DesignTokenType[];

  /**
   * Defines the parser to be used for converting design tokens to SCSS.
   * This should be one of the predefined parsers that handle specific token formats.
   */
  parser: ScssifyTokenParser;

  /**
   *  Defines the format for the output color values in SCSS/CSS.
   *  The default setting is 'hex'.
   */
  color: 'hex' | 'rgba';

  /**
   * Determines the unit of measurement for dimension tokens when converted to SCSS/CSS.
   * The default is set to 'pixel'.
   */
  dimension: 'pixel' | 'rem';

  /**
   * The directory where the generated token files will be stored.
   * @example 'packages/themes/default/src/token'
   */
  outputDir: string;

  /**
   * The name of the theme for which the design tokens are being converted.
   * This helps in identifying different themes within your project configurations.
   */
  themeName: string;

  /**
   * A prefix for each token. It's help to create an uniq token name
   */
  prefix: string;
}
