import { afterRenderEffect, signal, untracked, type Signal, type TemplateRef } from '@angular/core';

const TEXT_PARTS = ['CCK-TOOLTIP-TITLE', 'CCK-TOOLTIP-DESCRIPTION'];

/**
 * The text of the content template while the tooltip is closed, so the trigger is described before the content is
 * shown: the title, then the description, one space apart. A content with any other element, or with no part, gives
 * `''`. The template is rendered once, off the document, read and destroyed; it is read again each time the tooltip
 * closes. Nothing runs on the server.
 *
 * @param template - The `cckTooltipPortal` template, when there is one.
 * @param shown - Whether the tooltip shows its own content, which is read as it is then.
 * @internal
 */
export function templateText(template: Signal<TemplateRef<void> | null>, shown: Signal<boolean>): Signal<string> {
  const text = signal('');
  afterRenderEffect({
    write: () => {
      const current = template();
      if (shown()) return;
      text.set(
        untracked(() => {
          const view = current?.createEmbeddedView();
          if (!view) return '';
          view.detectChanges();
          const parts = Array.from((view.rootNodes[0] as Element | undefined)?.children ?? []);
          view.destroy();
          const ok = parts.length > 0 && parts.every((part) => TEXT_PARTS.includes(part.tagName));
          return ok
            ? parts
                .map((part) => part.textContent)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim()
            : '';
        }),
      );
    },
  });
  return text;
}
