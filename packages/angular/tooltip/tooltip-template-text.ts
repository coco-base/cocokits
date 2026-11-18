import { afterRenderEffect, signal, untracked, type Signal, type TemplateRef } from '@angular/core';

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;
const TEXT_PARTS = new Set(['CCK-TOOLTIP-TITLE', 'CCK-TOOLTIP-DESCRIPTION']);

/**
 * The text of a tooltip content that has a `cck-tooltip-title` or a `cck-tooltip-description`: the parts and the text
 * around them, one space apart. Any other element, and a content without a part, give `''`: only the parts are
 * the text of the tooltip.
 */
function textOfContent(content: Element): string {
  let text = '';
  let hasPart = false;
  for (const node of Array.from(content.childNodes)) {
    if (node.nodeType === TEXT_NODE) text += node.textContent ?? '';
    else if (node.nodeType === ELEMENT_NODE && TEXT_PARTS.has((node as Element).tagName)) {
      hasPart = true;
      text += ` ${node.textContent ?? ''} `;
    } else if (node.nodeType === ELEMENT_NODE) return '';
  }
  return hasPart ? text.replace(/\s+/g, ' ').trim() : '';
}

/**
 * The text of the content template while the tooltip is closed, so the trigger is described before the content is
 * shown. The template is rendered once, off the document, read and destroyed; it is read again
 * each time the tooltip closes. Nothing runs on the server.
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
          if (!current) return '';
          const view = current.createEmbeddedView();
          try {
            view.detectChanges();
            const content = view.rootNodes.find(
              (node: Node) => node.nodeType === ELEMENT_NODE && (node as Element).tagName === 'CCK-TOOLTIP-CONTENT',
            ) as Element | undefined;
            return content ? textOfContent(content) : '';
          } finally {
            view.destroy();
          }
        }),
      );
    },
  });
  return text;
}
