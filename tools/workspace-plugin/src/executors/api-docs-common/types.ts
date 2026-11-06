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
  /** The title of a common task this member answers (`@cckTask <title>`); needs an `@example`. */
  task?: string;
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

/** A public symbol that is not a part: a service, a class or a constant (Angular entry points). */
export interface ApiSymbolJson {
  kind: 'service' | 'class' | 'constant';
  name: string;
  description: string;
  remarks?: string;
  examples?: string[];
  /** The type of a constant, as source text. */
  type?: string;
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
}

/** The API of one component in one framework: the JSON file an extractor writes. */
export interface ApiDocJson {
  component: string;
  framework: 'angular' | 'react' | 'vue';
  parts: ApiPartJson[];
  /** Services, classes and constants of the entry point (Angular). */
  services?: ApiSymbolJson[];
  /** The interfaces and aliases the entry point exports, except the ones read as a part's members. */
  types?: ApiTypeJson[];
}

/** One TSDoc tag: its name without the `@` and its text. */
export interface TagEntry {
  readonly name: string;
  readonly comment: string;
}
