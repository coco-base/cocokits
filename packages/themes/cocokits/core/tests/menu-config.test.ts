import { defineAnatomy, resolveThemeAttrs } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { menuContentSizeDefaultMode, menuContentSizeModes } from '../src/generated/token-modes';
import { cocokitsThemeConfig } from '../src/index';

describe('cocokitsThemeConfig menu', () => {
  const options = cocokitsThemeConfig.components.menu;
  const anatomy = defineAnatomy({
    block: 'menu',
    parts: {
      root: { name: 'Root', description: 'The root.' },
      trigger: { name: 'Trigger', description: 'The trigger.' },
      content: { name: 'Content', description: 'The panel.' },
      item: { name: 'Item', description: 'An action.' },
    },
  });

  it('has the size option only, rendered as data-size on the content, default md', () => {
    expect(Object.keys(options)).toEqual(['size']);
    expect(options.size.attrName).toBe('size');
    expect(options.size.default).toBe('md');
    expect(options.size.values).toEqual(['sm', 'md', 'lg']);
    expect(options.size.partNames).toEqual(['content']);
  });

  it('takes the size modes from the generated token modes', () => {
    expect(options.size.values).toBe(menuContentSizeModes);
    expect(options.size.default).toBe(menuContentSizeDefaultMode);
  });

  it('resolves the default, an own size and null, on the content and on no other part', () => {
    const resolved = resolveThemeAttrs(cocokitsThemeConfig, anatomy);
    expect(resolved.content).toEqual({ 'data-size': 'md' });
    expect(resolved.root).toEqual({});
    expect(resolved.trigger).toEqual({});
    expect(resolved.item).toEqual({});
    expect(resolveThemeAttrs(cocokitsThemeConfig, anatomy, { size: 'lg' }).content).toEqual({ 'data-size': 'lg' });
    expect(resolveThemeAttrs(cocokitsThemeConfig, anatomy, { size: null }).content).toEqual({});
  });
});
