import { onMounted, watch } from 'vue';
import { isDevelopment } from '@cocokits/vue-core';

/**
 * In development, warns when an overlay is open and its content has no trigger to anchor to (a Popover or a
 * Tooltip renders nothing then). Call it from the content's setup.
 *
 * @internal
 * @param content - The name of the content part, for the message.
 * @param trigger - The name of the trigger part, for the message.
 * @param isOpen - Reads whether the overlay is open.
 * @param getTrigger - Reads the trigger element, `null` while there is none.
 */
export function warnWithoutTrigger(
  content: string,
  trigger: string,
  isOpen: () => boolean,
  getTrigger: () => Element | null,
): void {
  if (!isDevelopment()) return;
  const check = (): void => {
    if (isOpen() && getTrigger() === null) {
      console.warn(`CocoKits: <${content}> has no <${trigger}>: it needs one to anchor to, and renders nothing.`);
    }
  };
  onMounted(check);
  watch(isOpen, check, { flush: 'post' });
}
