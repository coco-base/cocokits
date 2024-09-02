import { Path, TokenParser } from './token.model';

export interface TokenGeneratorExecutorSchema {
  /**
   * The path to the JSON file containing the design tokens.
   * This path is used to locate and read the design tokens that will be converted into SCSS variables.
   *
   */
  files: Path[];

  /**
   * Specifies the the name of collection to exclude from the token conversion process.
   * This helps to ignore certain files or directories that are not needed in the SCSS output.
   */
  excludeCollections: string[];

  /**
   * The pattern for find the fontWeight token, to replace weight name with number value.
   * For example: Medium -> 500
   */
  fontWeightPattern: string;

  /**
   * Defines the parser to be used for converting design tokens to SCSS.
   * This should be one of the predefined parsers that handle specific token formats.
   */
  parser: TokenParser;

  /**
   * The directory where the generated token files will be stored.
   * @example 'packages/themes/default/src/token'
   */
  outputDir: Path;

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
