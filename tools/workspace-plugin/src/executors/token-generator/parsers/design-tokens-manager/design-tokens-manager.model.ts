import { Path, TokenCollectionName } from '../../token.model';

// regionParser
// export type CollectionFlatName = string; // `sizing.compact` or `sizing.spacious'`
// export type CollectionPath = string; // `packages/themes/default/json-token/Sizing.Compact.tokens.json`

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
// export type CollectionPathMap = Record<CollectionFlatName, CollectionPath[]>;
//
// export type CollectionDTMTokenMap = Record<CollectionFlatName, DTMTokenGroup>;

// endregion

// region Design Token Manager
export type DTMModePaths = Record<TokenCollectionName, Path[]>;

export interface DTMManifest {
  name: string;
  collections: Record<TokenCollectionName, DTMCollection>;
  styles: DTMModePaths;
}

export interface DTMCollection {
  modes: DTMModePaths;
}

export type DTMGroupOrValue = DTMTokenGroup | DTMTokenValue;

export interface DTMTokenGroup {
  [key: string]: DTMGroupOrValue;
}

export type DTMTokenRawValue =
  | DTMRawColorTokenValue
  | DTMRawStringTokenValue
  | DTMRawDimensionTokenValue
  | DTMRawTypographyTokenValue
  | DTMRawGradientTokenValue
  | DTMRawShadowTokenValue;

export type DTMTokenValue =
  | DTMColorValue
  | DTMStringValue
  | DTMDimensionValue
  | DTMTypographyValue
  | DTMGradientValue
  | DTMShadowValue;

export type DTMRawColorTokenValue = string | { value: string; alpha: number };
export interface DTMColorValue {
  $type: 'color';
  $value: DTMRawColorTokenValue;
}

export type DTMRawStringTokenValue = string; // 4px
export interface DTMStringValue {
  $type: 'string';
  $value: DTMRawStringTokenValue;
}

export type DTMRawDimensionTokenValue = string; // 4px
export interface DTMDimensionValue {
  $type: 'dimension';
  $value: DTMRawDimensionTokenValue;
}

export interface DTMRawTypographyTokenValue {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  fontStyle?: string;
}
export interface DTMTypographyValue {
  $type: 'typography';
  $value: DTMRawTypographyTokenValue;
}

export type DTMRawGradientTokenValue = {
  type?: 'linear' | 'radial'; // Default is `linear`
  angle?: string; // Only for `linear` type.
  stops: {
    color: number;
    position?: number;
  }[];
};
export interface DTMGradientValue {
  $type: 'gradient';
  $value: DTMRawGradientTokenValue;
}

export type DTMRawShadowTokenValue =
  | {
      color: string;
      offsetX: string;
      offsetY: string;
      blur: string;
      spread: string;
      inset?: boolean;
    }[]
  | { blur: string };
export interface DTMShadowValue {
  $type: 'shadow';
  $value: DTMRawShadowTokenValue;
}

// endregion
