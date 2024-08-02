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

export type TokenId = string;
export type TokenRawGroupNamePath = string[]; // ['Color Platte', 'Blue']
export type TokenGroupNamePath = string[]; // ['color-platte', 'blue']

export type TokenRawNamePath = string[]; // ['Color Platte', 'Blue', '100']
export type TokenNamePath = string[]; // ['color-platte', 'blue', '100']

export type TokenRawGroupName = string; // 'Color', 'Color Platte' but not '100'
export type TokenGroupName = string; // 'color-platte' or 'blue' but not '100'

export type TokenRawName = string; // '100' or 'Low Contrast'
export type TokenName = string; // '100' or 'low-contrast'

export type TokenRawGroupOrName = string; // 'Color Platte' or 'Blue or '100'

export type TokenRawModeName = string; // Light, Dark, Small Screen
export type TokenModeName = string; // Light, Dark, small-screen
export interface TokenModeNames {
  rawName: TokenRawModeName;
  name: TokenModeName;
}

export type TokenRawCollectionName = string; // Color, Color Platte, Theme
export type TokenCollectionName = string; // color, color-platte, theme
export interface TokenCollectionNames {
  rawName: TokenRawCollectionName;
  name: TokenCollectionName;
}

/**
 * {
 *   "screen": [
 *     { rawName: 'Small Screen', name: 'small-screen' }
 *   ],
 * }
 */
export type TokenCollectionModeNames = Record<TokenCollectionName, TokenModeNames[]>;

export type TokenMap = Record<TokenId, Token>;
export type CollectionGroupHierarchy = Record<TokenCollectionName, GroupOrTokenIds>;
export interface GroupOrTokenIds {
  [group: TokenGroupName]: GroupOrTokenIds | TokenId[];
}

/**
 * Each token can have multiple end values depending on the alias hierarchy.
 * The first list represents all possible end value hierarchies.
 * The second list represents the hierarchy for a single end value.
 *
 * For example, 'color-brand' has 2 modes: 'light' and 'dark'.
 * For the 'light' mode, we use 'color-palate/blue/100' from the 'global' collection, which also has 2 modes ('theme-a' and 'theme-b').
 * For the 'dark' mode, we use 'color-palate/blue/700' from the 'global' collection, which also has 2 modes ('theme-a' and 'theme-b').
 * This results in 4 end values, and this hierarchy can continue.
 *
 * Hierarchical structure:
 *
 * color-brand --
 *               |-> [Mode: 'light'] color-palate/black/100 --
 *               |                                             |-> 1- [Collection: 'global', mode: 'theme-a'] #000
 *               |                                             \-> 2- [Collection: 'global', mode: 'theme-b'] #111
 *               |
 *               \-> [Mode: 'dark'] color-palate/black/400 --
 *                                                             |-> 3- [Collection: 'global', mode: 'theme-a'] #222
 *                                                             \-> 4- [Collection: 'global', mode: 'theme-b'] #333
 *
 * const colorButtonPrimary = [
 *   // colors/brand [theme-a] -> color-palate/black/100 [light]
 *   [
 *     { collectionName: 'colors', mode: 'theme-a', token: {} },
 *     { collectionName: 'global', mode: 'light', token: {} },
 *   ],
 *
 *   // colors/brand [theme-a] -> color-palate/black/500 [light]
 *   [
 *     { collectionName: 'colors', mode: 'theme-a', token: {} },
 *     { collectionName: 'global', mode: 'dark', token: {} },
 *   ],
 *
 *   // colors/brand [theme-b] -> color-palate/black/100 [dark]
 *   [
 *     { collectionName: 'colors', mode: 'theme-b', token: {} },
 *     { collectionName: 'global', mode: 'dark', token: {} },
 *   ],
 *
 *   // colors/brand [theme-b] -> color-palate/black/500 [dark]
 *   [
 *     { collectionName: 'colors', mode: 'theme-b', token: {} },
 *     { collectionName: 'global', mode: 'dark', token: {} },
 *   ],
 * ];
 */
export type AliasHierarchies = AliasHierarchy[][];

export interface AliasHierarchy {
  tokenId: TokenId;
  collectionName: TokenCollectionName;
  modeName: TokenModeName;
  namePath: TokenNamePath;
  type: TokenType;
}

export type TokenType = 'color' | 'string' | 'gradient' | 'dimension' | 'shadow' | 'typography';

// export enum TokenType {
//   Color = 'color',
//   String = 'string',
//   Gradient = 'gradient',
//   Dimension = 'dimension',
//   Shadow = 'shadow',
//   Typography = 'typography',
// }

export interface Token {
  id: string;
  collectionName: TokenCollectionName;
  rawNamePath: TokenRawNamePath;
  namePath: TokenNamePath;
  type: TokenType;
  /**
   * {
   *   light: {...}
   *   dark: {...}
   * }
   */
  modes: Record<
    TokenModeName,
    {
      /**
       * The original and untouched token, it can be different base on parser
       */
      rawValue: unknown;

      /**
       * The resolved final value of the token, which is always a literal value (e.g., "#fff")
       */
      value: string;
      /**
       * The alias of the token, which can be either 'null' for non-alias token or the token id of the alias
       */
      aliasTokenId: TokenId | null;
      /**
       * The alias hierarchies of the token with all sub aliases values, describing its ancestry and final resolved value
       * For non-alias token it will be null.
       */
      aliasHierarchies: AliasHierarchies | null;
    }
  >;
  variable: {
    name: string; // color-text-primary
    css: string; // var(--color-text-primary)
    scss: string; // $color-text-primary
  };
}

export interface TokenDictionary {
  collectionNames: TokenCollectionNames[];
  collectionModeNames: TokenCollectionModeNames;
  tokenMap: TokenMap;
  collectionGroupHierarchy: CollectionGroupHierarchy;
}

export type GroupsNameCollectionName = Record<TokenGroupName, TokenCollectionName>;

// endregion
