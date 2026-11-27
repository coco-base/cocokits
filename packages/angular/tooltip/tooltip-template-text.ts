import { afterRenderEffect, signal, untracked, type Injector, type Signal, type TemplateRef } from '@angular/core';
import { tooltipAnatomy } from '@cocokits/machines/tooltip';

const { title, description } = tooltipAnatomy.classes;

/**
 * The text of the content template while the tooltip is closed, so the trigger is described before the content is
 * shown: the title, then the description, one space apart. Text written beside the parts does not count. A content with any other element, or with no part, gives `''`. The template is rendered off the document, read and destroyed each time the tooltip closes, so it
 * must have no side effects. Nothing runs on the server.
 *
 * @param template - The template of the rich form, when there is one.
 * @param shown - Whether the tooltip shows its own content, which is read as it is then.
 * @param injector - The content injector of the outlet, so the parts find the root.
 * @internal
 */
export function templateText(
  template: Signal<TemplateRef<unknown> | null>,
  shown: Signal<boolean>,
  injector: Injector,
): Signal<string> {
  const text = signal('');
  afterRenderEffect({
    write: () => {
      const current = template();
      if (shown()) return;
      text.set(
        untracked(() => {
          const view = current?.createEmbeddedView(undefined, injector);
          if (!view) return '';
          view.detectChanges();
          const parts = Array.from((view.rootNodes[0] as Element | undefined)?.children ?? []);
          view.destroy();
          const isPart = ({ classList }: Element): boolean =>
            classList.contains(title) || classList.contains(description);
          return parts.every(isPart)
            ? parts
                .map((part) => part.textContent)
                .join(' ')
                .trim()
            : '';
        }),
      );
    },
  });
  return text;
}
