/** One documented member of a part: a prop, input, event, slot or method. The extractors write it from TSDoc. */
export interface ApiMemberJson {
  name: string;
  semanticId: string;
  type: string;
  default?: string;
  required: boolean;
  /** The reason the default differs from the other frameworks by design (`@cckDefaultDiffers`). */
  defaultDiffers?: string;
  description: string;
  remarks?: string;
  deprecated?: string;
  examples?: string[];
  /** A host-defined group of members (`@cckGroup forms`); the docs render a group as its own sub-table. */
  group?: string;
  /** `true` for a member of a props type every part shares (`@cckShared`); the docs list it once. */
  shared?: boolean;
  /** One entry per `@cckValue <literal> - <meaning>` tag: what each literal of the union means. */
  values?: ApiValueJson[];
}

/** One literal of a union with its meaning, from a `@cckValue` tag. */
export interface ApiValueJson {
  /** The literal without its quotes, for example `start`. */
  value: string;
  description: string;
}

/** One slot of a part. */
export interface ApiSlotJson extends ApiMemberJson {
  /** The `ng-content select`. Angular only. */
  selector?: string;
  /** The fields the slot gives its content (a scoped slot). */
  scope?: { name: string; type: string; description: string; semanticId?: 'none' }[];
}

/** One part of a component. */
export interface ApiPartJson {
  name: string;
  semanticId: string;
  /** Angular only. */
  selector?: string;
  /** Absent when the part renders no element. */
  anatomyPart?: string;
  /** Angular only: the anatomy parts the part renders internally besides its own. */
  renders?: string[];
  /** Angular only: the part the part also stands for. */
  section?: { partName: string; slotName: string; inputName: string };
  /** Angular only: the selector of the `ng-template` the part is declared inside. */
  templateSelector?: string;
  /** `true` for a part that exists in some frameworks only by design (`@cckSemantic none` on the part). */
  frameworkOnly?: true;
  description: string;
  /** The text after the first paragraph (`@remarks` included). */
  remarks?: string;
  /** The `@example` of the part: one complete usage that nests the parts the example needs. */
  examples?: string[];
  props: ApiMemberJson[];
  events: ApiMemberJson[];
  slots: ApiSlotJson[];
  methods: ApiMemberJson[];
  bindings?: { semanticId: string; value: string; syntax: string }[];
}

/** One parameter of a function symbol, from its declaration and its `@param` tag. */
export interface ApiParamJson {
  name: string;
  /** The type as written in the source. */
  type: string;
  /** `true` for a parameter with `?`, a default value or a rest parameter. */
  optional: boolean;
  description: string;
}

/** What a function symbol returns: the type as written and the text of its `@returns` tag (empty for `void`). */
export interface ApiReturnsJson {
  type: string;
  description: string;
}

/**
 * A public symbol that is not a part: a service, a class, a constant (Angular entry points) or a function (`ts`
 * entry points of `cdk` and `utils`).
 */
export interface ApiSymbolJson {
  kind: 'service' | 'class' | 'constant' | 'function';
  name: string;
  description: string;
  remarks?: string;
  examples?: string[];
  /** The type of a constant, as source text. */
  type?: string;
  /** The parameters of a function, in order. */
  params?: ApiParamJson[];
  /** The result of a function. */
  returns?: ApiReturnsJson;
  /** One text per `@throws` tag of a function. */
  throws?: string[];
  props: ApiMemberJson[];
  methods: ApiMemberJson[];
}

/** An exported interface or type alias. */
export interface ApiTypeJson {
  kind: 'interface' | 'alias';
  name: string;
  description: string;
  remarks?: string;
  /** The type text of an alias. */
  text?: string;
  /** The fields of an interface. */
  fields: ApiMemberJson[];
  /** The meaning of each literal of a union alias (`@cckValue`). */
  values?: ApiValueJson[];
}

/**
 * The API of one component in one framework, or of one module of a framework-free package (`ts`, with no parts): the
 * JSON file an extractor writes.
 */
export interface ApiDocJson {
  component: string;
  framework: 'angular' | 'react' | 'vue' | 'ts';
  parts: ApiPartJson[];
  /** Services, classes and constants of the entry point (Angular), and the functions and constants of a `ts` module. */
  symbols?: ApiSymbolJson[];
  /** The interfaces and aliases the entry point exports, except the ones read as a part's members. */
  types?: ApiTypeJson[];
}

/** One TSDoc tag: its name without the `@` and its text. */
export interface TagEntry {
  readonly name: string;
  readonly comment: string;
}
