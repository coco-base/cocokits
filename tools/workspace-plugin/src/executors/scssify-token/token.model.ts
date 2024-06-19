export type CollectionName = string;
export type ModeName = string;
export type ModeGroupName = string;
export type CSSVariableName = string; // color-palette-steel-gray-200 (ModeGroupName-TokenName)
export type CollectionWithModeName = string;
export type CssVariableNamesWithModeMap = Map<CSSVariableName, Set<ModeName>>;
export type TsStringVariableName = string; // 'colorPalette.cyan.950' -> CamelCase each group and joined by '.'
export type TsVariableNamesWithModeAndValueMap = Map<TsStringVariableName, { modes: Set<ModeName>; value: string }>;
export type TsVariableNamesWithValueMap = Map<TsStringVariableName, string>;

// { colorPalette: { cyan: { 950: '#000' } } }
export interface TsVariableMap {
  [key: string]: TsVariableMap | string;
}

export enum DesignTokenType {
  Border = 'border',
  Clamp = 'clamp',
  Color = 'color',
  CubicBezier = 'cubicBezier',
  Dimension = 'dimension',
  Typography = 'typography', // font
  FontFamily = 'fontFamily',
  FontWeight = 'fontWeight',
  Gradient = 'gradient',
  Shadow = 'shadow',
}

interface DesignTokenDependency {
  source: string[]; // [ 'blue', '50' ]
  dependOn: string[]; // [ 'colors', 'blue', '50' ]
}

export interface ParserResult {
  designTokenCollections: DesignTokenCollectionMap;
  tokenDefinitionMap: TokenDefinitionMap;
  collectionsMapWithMode: CollectionsMapWithMode;
}

export type DesignTokenDependencyMap = Record<CollectionWithModeName, DesignTokenDependency[]>;

export interface CompilerResult {
  transformedTokens: TransformedDesignTokenCollectionMap;
  newDependencies: DesignTokenDependencyMap;
}

/**
 * Example:
 * {
 *   "color-mode": ["dark", "light"],
 *   "radius": ["default", "rounded"],
 *   "local-style": ["default"]
 * }
 */
export type CollectionsMapWithMode = Record<CollectionName, ModeName[]>;

/**
 * Example:
 * {
 *   spacing: [ 'sizing.compact', 'sizing.spacious' ],
 *   colors: [ 'color-mode.light', 'color-mode.dark' ]
 * }
 */
export type TokenDefinitionMap = Record<CollectionName, CollectionWithModeName[]>;

/**
 * Example:
 * {
 *   color-mode.light: [
 *     { namePath: [ 'blue', '50' ], value: "#ffffff", type: 'color' },
 *     { namePath: [ 'blue', '100' ], value: "#ffffff", type: 'color' },
 *   ],
 *   ...
 * }
 */
export type DesignTokenCollectionMap = Record<CollectionWithModeName, DesignToken[]>;

/**
 * Example:
 * {
 *   color-mode.light: [
 *     { namePath: [ 'blue', '50' ], value: "#ffffff", type: 'color', isAlias:: false },
 *     { namePath: [ 'blue', '100' ], value: "#ffffff", type: 'color', isAlias:: false },
 *   ],
 *   ...
 * }
 */
export type TransformedDesignTokenCollectionMap = Record<CollectionWithModeName, TransformedDesignToken[]>;

export type DesignToken =
  | DesignTokenBorder
  | DesignTokenClamp
  | DesignTokenColor
  | DesignTokenCubicBezier
  | DesignTokenDimension
  | DesignTokenTypography
  | DesignTokenFontFamily
  | DesignTokenFontWeight
  | DesignTokenGradient
  | DesignTokenShadow;

export interface DesignTokenBase {
  namePath: string[]; // [ 'blue', '50' ]
  type: DesignTokenType;
  value: unknown;
  description?: string;
}

export interface TransformedDesignToken extends DesignTokenBase {
  value: string;
  isAlias: boolean;
}

export interface DesignTokenBorder extends DesignTokenBase {
  type: DesignTokenType.Border;
  value: {
    color: string;
    width: string;
    style: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'outset' | 'inset';
  };
}

export interface DesignTokenClamp extends DesignTokenBase {
  type: DesignTokenType.Clamp;
  value: {
    min: string;
    ideal: string;
    max: string;
  };
}

export interface DesignTokenColor extends DesignTokenBase {
  type: DesignTokenType.Color;
  value: string | { value: string; alpha: number };
}

export interface DesignTokenCubicBezier extends DesignTokenBase {
  type: DesignTokenType.CubicBezier;
  value: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface DesignTokenDimension extends DesignTokenBase {
  type: DesignTokenType.Dimension;
  value: string;
}

export interface DesignTokenTypography extends DesignTokenBase {
  type: DesignTokenType.Typography;
  value: {
    fontFamily: string;
    fontSize: string;
    fontWeight: number;
    lineHeight: string;
    fontStyle?: string;
  };
}

export interface DesignTokenFontFamily extends DesignTokenBase {
  type: DesignTokenType.FontFamily;
  value: string[];
}

export interface DesignTokenFontWeight extends DesignTokenBase {
  type: DesignTokenType.FontWeight;
  value: string | number;
}

export interface DesignTokenGradient extends DesignTokenBase {
  type: DesignTokenType.Gradient;
  value: {
    type?: 'linear' | 'radial'; // Default is `linear`
    angle?: string; // Only for `linear` type.
    stops: {
      color: number;
      position?: number;
    }[];
  };
}

export interface DesignTokenShadow extends DesignTokenBase {
  type: DesignTokenType.Shadow;
  value:
    | {
        color: string;
        offsetX: string;
        offsetY: string;
        blur: string;
        spread: string;
        inset?: boolean;
      }[]
    | { blur: string };
}
