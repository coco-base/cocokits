/** Inputs of `getLabelProps`. */
export interface LabelProps {
  /**
   * The `for` to render: the author's, or the effective control id while a CocoKits control is in the field.
   * Leave it out to render no `for`.
   */
  readonly for?: string | undefined;
  /** The id to render: inside a field, `FormFieldIds.label`, so a control can name itself by the label. */
  readonly id?: string | undefined;
  /** Whether the field's effective `required` is true. */
  readonly required?: boolean | undefined;
  /** Hides the required marker. */
  readonly hideRequiredMarker?: boolean | undefined;
}

/** Props of the root part. */
export interface LabelRootProps {
  /** The `cck-label` block class. */
  readonly class: string;
  /** The id of the labeled control; present when `for` was given. */
  readonly for?: string | undefined;
  /** The id of the label; present when `id` was given. */
  readonly id?: string | undefined;
}

/** Props of the required marker part. */
export interface LabelRequiredMarkerProps {
  /** The `cck-label__required-marker` class. */
  readonly class: string;
  /** Always `'true'`: the native `required` is what assistive technology announces. */
  readonly 'aria-hidden': 'true';
  /** The marker text. */
  readonly text: '*';
}

/** What `getLabelProps` returns. */
export interface LabelParts {
  /** The root props. */
  readonly root: LabelRootProps;
  /** The marker props, rendered as the last child of the label; `null` while there is nothing to show. */
  readonly requiredMarker: LabelRequiredMarkerProps | null;
}
