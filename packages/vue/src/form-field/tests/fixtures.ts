import { defineThemeConfig } from '@cocokits/shared';

/** A theme config with one `tone` option on the form field root. */
export const formFieldThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    'form-field': { tone: { attrName: 'tone', values: ['plain'], default: 'plain', partNames: ['root'] } },
  },
});
