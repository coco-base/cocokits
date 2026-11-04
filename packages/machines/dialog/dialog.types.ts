/** Why the dialog opened or closed. */
export type DialogChangeReason = 'trigger' | 'close' | 'escape' | 'outside-press';

/** Inputs of `getDialogProps` and `transitionDialog`. */
export interface DialogState {
  /** The SSR-stable id of the dialog, from the adapter. */
  readonly id: string;
  /** The open model. */
  readonly open: boolean;
  /**
   * Whether the content is in the document: `open`, or closed with an exit animation still running.
   * @defaultValue the value of `open`
   */
  readonly mounted?: boolean | undefined;
  /** Whether a Title is mounted; the content is labelled by it. @defaultValue false */
  readonly hasTitle?: boolean | undefined;
  /**
   * The id of the Title, when the author sets one. The Title's `id` and the content's `aria-labelledby` both come from it.
   * @defaultValue the id derived from `id`
   */
  readonly titleId?: string | undefined;
  /** Whether a Description is mounted; the content is described by it. @defaultValue false */
  readonly hasDescription?: boolean | undefined;
}

/** The events the handlers send. */
export type DialogEvent =
  | { readonly type: 'TRIGGER.CLICK'; readonly event: Event }
  | { readonly type: 'CLOSE.CLICK'; readonly event: Event }
  /** The platform closed the native dialog, for example a `<form method="dialog">` submit. */
  | { readonly type: 'CONTENT.CLOSE'; readonly event: Event }
  /** The layer stack asked the dialog to close. */
  | {
      readonly type: 'CONTENT.DISMISS';
      readonly reason: 'escape' | 'outside-press';
      readonly event: Event | null;
    };

/** The open change the adapter reports (when the model accepts it). */
export interface DialogTransition {
  /** The requested open state. */
  readonly open: boolean;
  /** Why. */
  readonly reason: DialogChangeReason;
}

/** The ids of the parts that link to each other. */
export interface DialogIds {
  /** The trigger id. */
  readonly trigger: string;
  /** The content (native dialog) id. */
  readonly content: string;
  /** The title id. */
  readonly title: string;
  /** The description id. */
  readonly description: string;
}

/** Props shared by every part. */
export interface DialogPartProps {
  /** The part's class from the anatomy. */
  readonly class: string;
}

/** Props of the trigger. */
export interface DialogTriggerProps extends DialogPartProps {
  /** The trigger id. */
  readonly id: string;
  /** Always `'button'`. */
  readonly type: 'button';
  /** Always `'dialog'`. */
  readonly 'aria-haspopup': 'dialog';
  /** The open state, always rendered. */
  readonly 'aria-expanded': 'true' | 'false';
  /** The content id, only while the content is mounted. */
  readonly 'aria-controls'?: string | undefined;
  /** `open` or `closed`. */
  readonly 'data-state': 'open' | 'closed';
  /** Sends `TRIGGER.CLICK` unless a consumer handler vetoed the click. */
  readonly onClick: (event: Event) => void;
}

/** Props of the content, a native `dialog`. It has no role of its own: the element has one. */
export interface DialogContentProps extends DialogPartProps {
  /** The content id. */
  readonly id: string;
  /** The title id, only while a Title is mounted. */
  readonly 'aria-labelledby'?: string | undefined;
  /** The description id, only while a Description is mounted. */
  readonly 'aria-describedby'?: string | undefined;
  /** `open` or `closed`. */
  readonly 'data-state': 'open' | 'closed';
  /** Sends `CONTENT.CLOSE`. Bind it to the `close` event of the native dialog. */
  readonly onClose: (event: Event) => void;
}

/** Props of the title or the description. */
export interface DialogTextProps extends DialogPartProps {
  /** The id the content refers to. */
  readonly id: string;
}

/** Props of the Close part. */
export interface DialogCloseProps extends DialogPartProps {
  /** Always `'button'`, so Close never submits a form on its own. */
  readonly type: 'button';
  /** Sends `CLOSE.CLICK` unless a consumer handler vetoed the click. */
  readonly onClick: (event: Event) => void;
}

/** What `getDialogProps` returns. The root renders no element, so it has no props. */
export interface DialogParts {
  /** The trigger props. */
  readonly trigger: DialogTriggerProps;
  /** The native dialog props. */
  readonly content: DialogContentProps;
  /** The title props. */
  readonly title: DialogTextProps;
  /** The description props. */
  readonly description: DialogTextProps;
  /** The Close props. */
  readonly close: DialogCloseProps;
}
