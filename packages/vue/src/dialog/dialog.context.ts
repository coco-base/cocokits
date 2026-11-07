import { inject, type ComputedRef, type InjectionKey, type ShallowRef, type ComponentPublicInstance } from 'vue';
import type { DialogEvent } from '@cocokits/machines/dialog';

/** What a DialogRoot gives its parts. */
export interface DialogContextValue {
  /** The id the part ids derive from (`useId()` of the root). */
  readonly id: string;
  /** Whether the dialog is open. */
  readonly open: ComputedRef<boolean>;
  /** Whether the dialog opens modal (`showModal()`); `false` opens it non-modal (`show()`). */
  readonly modal: ComputedRef<boolean>;
  /** Whether the content leaves the document when the dialog closes; `false` keeps it, closed. */
  readonly unmountOnHide: ComputedRef<boolean>;
  /** Whether the content is in the document: open, or closed with its exit animation still running. */
  readonly mounted: ShallowRef<boolean>;
  /** Whether the Trigger opened the dialog (not a controlled `open`): focus returns to it on close. */
  readonly openedByTrigger: ShallowRef<boolean>;
  /** How many DialogTitles are mounted; the content is labelled by the title while there is one. */
  readonly titles: ShallowRef<number>;
  /** How many DialogDescriptions are mounted. */
  readonly descriptions: ShallowRef<number>;
  /** The trigger element; `null` until the trigger mounted. */
  readonly triggerElement: ShallowRef<HTMLElement | null>;
  /** Makes the element of this trigger instance the live `triggerElement`; `null` on unmount. */
  readonly followTrigger: (instance: ComponentPublicInstance | null) => void;
  /** The content (native `dialog`) element; `null` while it is not rendered. */
  readonly contentElement: ShallowRef<HTMLDialogElement | null>;
  /** Hands an event of a part to the machine and applies the change it accepts. */
  readonly send: (event: DialogEvent) => void;
}

/** Injection key of the dialog context. Not exported from any entry point. */
export const DIALOG_KEY: InjectionKey<DialogContextValue> = Symbol('cck-dialog');

/**
 * The context of the nearest DialogRoot.
 *
 * @param part - The name of the calling part, for the error.
 * @returns The context.
 * @throws When the part is used outside a DialogRoot.
 */
export function useDialogContext(part: string): DialogContextValue {
  const context = inject(DIALOG_KEY, undefined);
  if (!context) throw new Error(`CocoKits: <${part}> must be used inside <DialogRoot>.`);
  return context;
}
