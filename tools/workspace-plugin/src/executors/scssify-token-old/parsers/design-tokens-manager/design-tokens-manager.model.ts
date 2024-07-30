import { CollectionName, DesignTokenType } from '../../token.model';

// regionParser
export type CollectionFlatName = string; // `sizing.compact` or `sizing.spacious'`
export type CollectionPath = string; // `packages/themes/default/json-token/Sizing.Compact.tokens.json`

/**
 * @return example
 * {
 *   global: [ '*.tokens.json' ],
 *   'sizing.compact': [ '*.tokens.json' ],
 *   'sizing.spacious': [ '*.tokens.json' ],
 *   'color-theme.theme-a': [ '*.tokens.json' ],
 *   'color-theme.theme-b': [ '*.tokens.json' ]
 * }
 */
export type CollectionPathMap = Record<CollectionFlatName, CollectionPath[]>;

export type CollectionDTMTokenMap = Record<CollectionFlatName, DTMTokenGroup>;

// endregion

// region Design Token Manager
export type DTMPaths = Record<CollectionName, string[]>;

export interface DTMManifest {
  name: string;
  collections: Record<string, DTMCollection>;
  styles: DTMPaths;
}

export interface DTMCollection {
  modes: DTMPaths;
}

export type DTMGroupOrValue = DTMTokenGroup | DTMValue;

export interface DTMTokenGroup {
  [key: string]: DTMGroupOrValue;
}

export type DTMValue =
  | DTMBorderValue
  | DTMClampValue
  | DTMColorValue
  | DTMDimensionValue
  | DTMTypographyValue
  | DTMFontFamilyValue
  | DTMFontWeightValue
  | DTMGradientValue
  | DTMShadowValue;

export interface DTMBorderValue {
  $type: DesignTokenType.Border;
  $value: {
    color: string;
    width: string;
    style: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'outset' | 'inset';
  };
}

export interface DTMClampValue {
  $type: DesignTokenType.Clamp;
  $value: {
    min: string;
    ideal: string;
    max: string;
  };
}

export interface DTMColorValue {
  $type: DesignTokenType.Color;
  $value: string | { value: string; alpha: number };
}

export interface DTMDimensionValue {
  $type: DesignTokenType.Dimension;
  $value: string;
}

export interface DTMCubicBezierValue {
  $type: DesignTokenType.CubicBezier;
  $value: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface DTMDimensionValue {
  $type: DesignTokenType.Dimension;
  $value: string;
}

export interface DTMTypographyValue {
  $type: DesignTokenType.Typography;
  $value: {
    fontFamily: string;
    fontSize: string;
    fontWeight: number;
    lineHeight: string;
    fontStyle?: string;
  };
}

export interface DTMFontFamilyValue {
  $type: DesignTokenType.FontFamily;
  $value: string[];
}

export interface DTMFontWeightValue {
  $type: DesignTokenType.FontWeight;
  $value: string | number;
}

export interface DTMGradientValue {
  $type: DesignTokenType.Gradient;
  $value: {
    color: number;
    position?: number;
  }[];
}

export interface DTMShadowValue {
  $type: DesignTokenType.Shadow;
  $value:
    | {
        color: string;
        offsetX: string;
        offsetY: string;
        blur: string;
        spread: string;
        inset?: boolean;
      }[]
    | {
        backgroundBlue: true; // It must be `backgroundBlur` but the design-token-manager has a bug
        blur: string;
      }[];
}

// endregion
