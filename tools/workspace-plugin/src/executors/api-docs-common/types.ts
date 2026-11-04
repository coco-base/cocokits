/** `ApiMember` of `@cocokits/shared`, which the workspace plugin cannot import. */
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

/** `ApiSlot` of `@cocokits/shared`. */
export interface ApiSlotJson extends ApiMemberJson {
  /** The `ng-content select`. Angular only. */
  selector?: string;
  /** The fields the slot gives its content (a scoped slot). */
  scope?: { name: string; type: string; description: string; semanticId?: 'none' }[];
}

/** `ApiPart` of `@cocokits/shared`. */
export interface ApiPartJson {
  name: string;
  semanticId: string;
  /** Angular only. */
  selector?: string;
  /** Absent when the part renders no element. */
  anatomyPart?: string;
  /** Angular only: the anatomy parts the part renders internally besides its own. */
  renders?: string[];
  /** Angular only: the story part the part also stands for. */
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

/** `ApiDoc` of `@cocokits/shared`, which the workspace plugin cannot import. */
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
