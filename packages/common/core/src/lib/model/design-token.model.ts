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
export type TokenCollectionGroupHierarchy = Record<TokenCollectionName, TokenGroupOrTokenIds>;

export interface TokenGroupOrTokenIds {
  [group: TokenGroupName]: TokenGroupOrTokenIds | TokenId[];
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
export type TokenAliasHierarchies = TokenAliasHierarchy[][];

export interface TokenAliasHierarchy {
  tokenId: TokenId;
  collectionName: TokenCollectionName;
  modeName: TokenModeName;
  namePath: TokenNamePath;
  type: TokenType;
}

export type TokenType = 'color' | 'string' | 'gradient' | 'dimension' | 'shadow' | 'typography';

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
      aliasHierarchies: TokenAliasHierarchies | null;
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
  collectionGroupHierarchy: TokenCollectionGroupHierarchy;
}

export type TokenGroupsNameCollectionName = Record<TokenGroupName, TokenCollectionName>;
