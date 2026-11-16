import { defineAnatomy, resolveThemeAttrs } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { cocokitsThemeConfig } from '../src/index';

describe('cocokitsThemeConfig overlay and group options', () => {
  it.each([
    ['dialog', ['xs', 'sm', 'md', 'lg', 'xl']],
    ['tooltip', ['sm', 'md', 'lg']],
  ] as const)('gives the %s a size on the content part only, default md', (name, values) => {
    const { size } = cocokitsThemeConfig.components[name];
    expect(size.values).toEqual(values);
    expect(size.default).toBe('md');
    expect(size.partNames).toEqual(['content']);
  });

  it('renders the dialog and tooltip size on the content and on no other part', () => {
    for (const block of ['dialog', 'tooltip']) {
      const anatomy = defineAnatomy({
        block,
        parts: {
          root: { name: 'Root', description: 'The root.' },
          trigger: { name: 'Trigger', description: 'The trigger.' },
          content: { name: 'Content', description: 'The content.' },
        },
      });
      expect(resolveThemeAttrs(cocokitsThemeConfig, anatomy)).toEqual({
        root: {},
        trigger: {},
        content: { 'data-size': 'md' },
      });
      expect(resolveThemeAttrs(cocokitsThemeConfig, anatomy, { size: null }).content).toEqual({});
    }
  });

  it('gives the radio group the three options of its radios, with no default', () => {
    const options = cocokitsThemeConfig.components['radio-group'];
    expect(Object.keys(options)).toEqual(['size', 'color', 'labelPosition']);
    for (const option of Object.values(options)) {
      expect(option.default).toBeNull();
      expect(option.partNames).toEqual(['root']);
    }
  });

  it('gives the select an indicator on the content part, none by default', () => {
    const { indicator } = cocokitsThemeConfig.components.select;
    expect(indicator.values).toEqual(['checkmark', 'checkbox', 'none']);
    expect(indicator.default).toBeNull();
    expect(indicator.partNames).toEqual(['content']);
  });

  it.each(['input', 'textarea'] as const)('gives the %s a size on the root, default md', (name) => {
    const { size } = cocokitsThemeConfig.components[name];
    expect(size.values).toEqual(['sm', 'md', 'lg']);
    expect(size.default).toBe('md');
    expect(size.partNames).toEqual(['root']);
  });
});
