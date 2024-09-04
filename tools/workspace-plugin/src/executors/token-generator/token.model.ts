// region ---------------- Global ----------------

export type Path = string; // 'packages/themes/default/src/token'
export enum TokenParser {
  /**
   * Represents the parser for the Figma plugin "Design Tokens Manager".
   * This parser adheres to the W3C Design Tokens Format Module by the Design Tokens Community Group (DTCG).
   * The Design Tokens Manager helps in managing and converting design tokens within Figma to various formats.
   *
   * Figma plugin: https://www.figma.com/community/plugin/1263743870981744253/design-tokens-manager
   * Format Standard: W3C - Design Tokens Format Module by Design Tokens Community Group (DTCG)
   */
  DesignTokensManager = 'design-tokens-manager',
}

// endregion

// region ---------------- Tokens ----------------

// export enum TokenType {
//   Color = 'color',
//   String = 'string',
//   Gradient = 'gradient',
//   Dimension = 'dimension',
//   Shadow = 'shadow',
//   Typography = 'typography',
// }

// endregion
