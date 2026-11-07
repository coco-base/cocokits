import { h, type VNode } from 'vue';
import { AccordionContent, AccordionHeader, AccordionItem, AccordionRoot, AccordionTrigger } from '../index';

export { mountView } from '../../internal/tests/mount-helpers';

/** The options of {@link accordionView}. */
export interface AccordionViewOptions {
  /** Props and listeners of the root. */
  readonly root?: Record<string, unknown>;
  /** Props of the Returns item (the second one). */
  readonly returns?: Record<string, unknown>;
  /** Props of the Shipping content. */
  readonly content?: Record<string, unknown>;
  /** Props of the Shipping header. */
  readonly header?: Record<string, unknown>;
}

/** One item: header with a trigger, and a content. */
export function sectionView(
  value: string,
  label: string,
  body: () => VNode | string,
  itemProps: Record<string, unknown> = {},
  contentProps: Record<string, unknown> = {},
  headerProps: Record<string, unknown> = {},
): VNode {
  return h(AccordionItem, { value, ...itemProps }, () => [
    h(AccordionHeader, headerProps, () => h(AccordionTrigger, null, () => label)),
    h(AccordionContent, contentProps, body),
  ]);
}

/** Three sections between two buttons of the page; Shipping holds a link. */
export function accordionView(options: AccordionViewOptions = {}): () => VNode[] {
  return () => [
    h('button', 'before'),
    h(AccordionRoot, options.root ?? {}, () => [
      sectionView(
        'shipping',
        'Shipping',
        () => h('a', { href: '#rates' }, 'Shipping rates'),
        {},
        options.content,
        options.header,
      ),
      sectionView('returns', 'Returns', () => 'Send it back.', options.returns),
      sectionView('warranty', 'Warranty', () => 'Two years.'),
    ]),
    h('button', 'after'),
  ];
}
