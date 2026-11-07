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
  props: ApiMemberJson[];
  events: ApiMemberJson[];
  slots: ApiSlotJson[];
  methods: ApiMemberJson[];
  bindings?: { semanticId: string; value: string; syntax: string }[];
}

/** The API of one component in one framework: the JSON file an extractor writes. */
export interface ApiDocJson {
  component: string;
  framework: 'angular' | 'react' | 'vue';
  parts: ApiPartJson[];
}

/** One TSDoc tag: its name without the `@` and its text. */
export interface TagEntry {
  readonly name: string;
  readonly comment: string;
}
