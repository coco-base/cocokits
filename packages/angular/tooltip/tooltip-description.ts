import { afterRenderEffect, signal, type Signal, type WritableSignal } from '@angular/core';
import { createDescription, type Description } from '@cocokits/cdk/portal';
import type { TooltipDescription } from '@cocokits/machines/tooltip';

/** What {@link describeTrigger} reads and writes. @internal */
export interface TooltipDescriptionOptions {
  /** The trigger the description belongs to. */
  readonly trigger: Signal<HTMLElement | null>;
  /** The trimmed message. */
  readonly text: Signal<string>;
  /** A disabled tooltip has no description. */
  readonly disabled: Signal<boolean>;
  /** The id of the description element. */
  readonly id: string;
  /** Receives what the machine needs to know: `described`, `suppressed` or `none`. */
  readonly state: WritableSignal<TooltipDescription>;
}

/**
 * Keeps the hidden description of a Tooltip trigger. It exists after mount while the message is not empty and
 * the tooltip is not disabled, and tells the machine whether the trigger is `described` or `suppressed` (the
 * message equals its `aria-label`). It follows the message and the trigger's `aria-label`. Call it in an
 * injection context; nothing runs on the server.
 *
 * @param options - The signals to read and the state to write.
 * @internal
 */
export function describeTrigger(options: TooltipDescriptionOptions): void {
  const { trigger, text, disabled, id, state } = options;
  const describer = signal<Description | null>(null);
  const labelChanges = signal(0);
  afterRenderEffect({
    write: (onCleanup) => {
      const element = trigger();
      if (!element) return;
      const description = createDescription(element, { id });
      const observer = new MutationObserver(() => {
        labelChanges.update((count) => count + 1);
      });
      observer.observe(element, { attributes: true, attributeFilter: ['aria-label'] });
      describer.set(description);
      onCleanup(() => {
        observer.disconnect();
        description.destroy();
        describer.set(null);
        state.set('none');
      });
    },
  });
  afterRenderEffect({
    write: () => {
      const [description, message, off] = [describer(), text(), disabled()];
      labelChanges();
      if (!description) return;
      const wanted = off ? '' : message;
      const exists = description.update(wanted);
      state.set(wanted === '' ? 'none' : exists ? 'described' : 'suppressed');
    },
  });
}
