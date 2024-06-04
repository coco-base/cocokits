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
  source: string[];
  dependOn: string[];
}

export interface ParserResult {
  designTokenCollections: DesignTokenCollectionMap;
  tokenDefinitionMap: TokenDefinitionMap;
}

export type DesignTokenDependencyMap = Record<string, DesignTokenDependency[]>;

export interface CompilerResult {
  transformedTokens: TransformedDesignTokenCollectionMap;
  newDependencies: DesignTokenDependencyMap;
}

/**
 * Example:
 * {
 *   spacing: [ 'sizing.compact', 'sizing.spacious' ],
 *   colors: [ 'color-mode.light', 'color-mode.dark' ]
 * }
 */
export type TokenDefinitionMap = Record<string, string[]>;

export type DesignTokenCollectionMap = Record<string, DesignToken[]>;
export type TransformedDesignTokenCollectionMap = Record<string, TransformedDesignToken[]>;

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
  namePath: string[];
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
