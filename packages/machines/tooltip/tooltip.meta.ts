import type { ComponentMeta } from '@cocokits/shared';

/** Tooltip meta: data for tests and docs, never read at runtime. */
export const tooltipMeta: ComponentMeta<'root' | 'trigger' | 'content' | 'arrow'> = {
  apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/',
  dataAttrs: {
    root: [],
    trigger: ['data-state'],
    content: ['data-state', 'data-side', 'data-align'],
    arrow: [],
  },
  roles: { root: null, trigger: null, content: 'tooltip', arrow: null },
  keyboard: [
    {
      key: 'Tab (focus arrives)',
      context: 'trigger',
      action: 'Shows the tooltip at once, when the focus is keyboard focus (focus-visible only).',
    },
    {
      key: 'Escape',
      context: 'trigger focused, tooltip shown',
      action: 'Hides the tooltip through the dismissal stack (cdk). Focus stays on the trigger.',
    },
    { key: 'Tab (focus leaves)', context: 'trigger', action: 'Hides the tooltip.' },
  ],
  defaultElements: { trigger: 'button', content: 'div', arrow: 'span' },
  form: 'None: Tooltip is not a form control.',
};
