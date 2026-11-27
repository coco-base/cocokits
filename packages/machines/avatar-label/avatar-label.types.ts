/** Inputs of `getAvatarLabelProps`. */
export interface AvatarLabelProps {
  /** The name of the person. `undefined`, `null` and `""` leave the name out. */
  readonly name?: string | null | undefined;
  /** A second line, such as a role or an email. `undefined`, `null` and `""` leave it out. */
  readonly description?: string | null | undefined;
}

/** Props of a part that only carries its class. */
export interface AvatarLabelPartProps {
  /** The class of the part. */
  readonly class: string;
}

/** What `getAvatarLabelProps` returns. A part that is not rendered is `null`. */
export interface AvatarLabelParts {
  /** The root props. */
  readonly root: AvatarLabelPartProps;
  /** The text block; `null` when neither name nor description is set. */
  readonly text: AvatarLabelPartProps | null;
  /** The name; `null` when `name` is empty. */
  readonly name: AvatarLabelPartProps | null;
  /** The description; `null` when `description` is empty. */
  readonly description: AvatarLabelPartProps | null;
}
