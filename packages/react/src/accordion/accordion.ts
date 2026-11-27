import { AccordionContent } from './accordion-content';
import { AccordionHeader } from './accordion-header';
import { AccordionItem } from './accordion-item';
import { AccordionRoot } from './accordion-root';
import { AccordionTrigger } from './accordion-trigger';
import type {
  AccordionContentProps,
  AccordionHeaderProps,
  AccordionItemProps,
  AccordionPart,
  AccordionRootProps,
  AccordionTriggerProps,
} from './accordion.types';

/** The shape of the {@link Accordion} namespace. */
interface AccordionNamespace {
  readonly Root: AccordionPart<AccordionRootProps>;
  readonly Item: AccordionPart<AccordionItemProps>;
  readonly Header: AccordionPart<AccordionHeaderProps>;
  readonly Trigger: AccordionPart<AccordionTriggerProps>;
  readonly Content: AccordionPart<AccordionContentProps>;
}

/**
 * The Accordion parts as a namespace: `Accordion.Root`, `Accordion.Item`, `Accordion.Header`,
 * `Accordion.Trigger` and `Accordion.Content`. A stack of sections that open and close, one or several at a time.
 */
export const Accordion: AccordionNamespace = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Header: AccordionHeader,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
};
