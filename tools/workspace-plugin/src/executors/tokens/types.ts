export interface Token {
  name: string;
  type: 'color' | 'number' | 'string';
  /** Required on `number`: `px`, `rem`, `em`, `%` or `unitless`. */
  unit?: string;
  /** A literal, or an alias `{<Collection name>#<token name>}`. */
  valuesByMode: Record<string, string | number>;
}

export interface Collection {
  name: string;
  /** 1 Core, 2 Theme, 3 Component (`<Name> / Size`, `<Name> / Structure`). */
  tier: 1 | 2 | 3;
  prefix?: string;
  defaultMode: string;
  modes: string[];
  /** Tier 3: further blocks (`tab-nav`) that read the same variables; the collection is emitted for them too. */
  alsoFor?: string[];
  tokens: Token[];
}

/** One mode of a collection in the modes index (`ModeValue` in `@cocokits/shared`, which this plugin cannot import). */
export interface ModeValue {
  name: string;
  value: string;
}

/** One entry of the modes index (`ModeCollection` in `@cocokits/shared`). */
export interface ModeCollection {
  name: string;
  attrName: string;
  componentName?: string;
  modes: ModeValue[];
  defaultMode: string;
}

export interface TokenFile {
  $meta: { globalPrefix: string };
  collections: Collection[];
}

export type TokenFormat = 'css' | 'scss';
