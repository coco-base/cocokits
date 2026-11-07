import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { formFieldAnatomy } from '@cocokits/machines/form-field';
import { hintAnatomy } from '@cocokits/machines/hint';
import { labelAnatomy } from '@cocokits/machines/label';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { CckHintImports } from '../../hint';
import { CckLabelImports } from '../../label';
import { CckFormFieldImports } from '../index';

// An option that targets every part of an anatomy.
const optionFor = (anatomy: { readonly parts: object }) => ({
  probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(anatomy.parts) },
});

const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    [formFieldAnatomy.block]: optionFor(formFieldAnatomy),
    [labelAnatomy.block]: optionFor(labelAnatomy),
    [hintAnatomy.block]: optionFor(hintAnatomy),
  },
});

describe('FormField, Label and Hint theme', () => {
  it('puts the theme attribute on every rendered part of all three components', async () => {
    const { container } = await render(
      `<cck-form-field required><label cckLabel>Name</label><input /><cck-hint>Help</cck-hint></cck-form-field>`,
      {
        imports: [...CckFormFieldImports, ...CckLabelImports, ...CckHintImports],
        providers: [provideCckTheme(themeConfig)],
      },
    );
    // The field is required, so the Label renders its required marker too.
    const all = [formFieldAnatomy, labelAnatomy, hintAnatomy].flatMap((anatomy) => Object.values(anatomy.classes));
    expect(all).toHaveLength(7);
    for (const className of all) {
      const part = container.querySelector(`.${className}`);
      expect(part, className).not.toBeNull();
      expect(part?.getAttribute('data-probe'), className).toBe('on');
    }
  });
});
