import { Accordion as BaseAccordion } from '@cocokits/react/accordion';
import { AccordionRoot, type AccordionRootComponent } from './accordion-root';

/** The cocokits {@link Accordion} parts: the themed `Root` and the base `Item`, `Header`, `Trigger` and `Content`. */
interface AccordionNamespace {
  readonly Root: AccordionRootComponent;
  readonly Item: typeof BaseAccordion.Item;
  readonly Header: typeof BaseAccordion.Header;
  readonly Trigger: typeof BaseAccordion.Trigger;
  readonly Content: typeof BaseAccordion.Content;
}

/**
 * The cocokits Accordion as a namespace: the themed `Accordion.Root` and the base `Accordion.Item`,
 * `Accordion.Header`, `Accordion.Trigger` and `Accordion.Content`, which the theme styles through the options of the
 * root.
 */
export const Accordion: AccordionNamespace = {
  Root: AccordionRoot,
  Item: BaseAccordion.Item,
  Header: BaseAccordion.Header,
  Trigger: BaseAccordion.Trigger,
  Content: BaseAccordion.Content,
};
