import { CckAccordion } from './accordion';
import { CckAccordionItem } from './accordion-item';
import { CckAccordionLabel } from './accordion-label';

export { CckAccordion } from './accordion';
export { CckAccordionItem } from './accordion-item';
export type { AccordionHeadingLevel } from './accordion-item';
export { CckAccordionLabel } from './accordion-label';

/**
 * Everything you need to write an Accordion in a template. Add it to the `imports` of your component.
 * @example
 * imports: [CckAccordionImports]
 */
export const CckAccordionImports = [CckAccordion, CckAccordionItem, CckAccordionLabel] as const;
