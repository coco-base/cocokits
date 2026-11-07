import { CckAccordion } from './accordion';
import { CckAccordionItem } from './accordion-item';
import { CckAccordionLabel } from './accordion-label';

export { CckAccordion } from './accordion';
export { CckAccordionItem } from './accordion-item';
export type { AccordionHeadingLevel } from './accordion-item';
export { CckAccordionLabel } from './accordion-label';

/** Everything needed to author an Accordion: `imports: [CckAccordionImports]`. */
export const CckAccordionImports = [CckAccordion, CckAccordionItem, CckAccordionLabel] as const;
