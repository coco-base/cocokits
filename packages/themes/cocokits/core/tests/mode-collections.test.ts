import { describe, expect, it } from 'vitest';
import { cocokitsThemeConfig, modeCollections } from '../src/index';
import { tokensCss } from './css-test-helpers';

const byName = (name: string) => modeCollections.find((collection) => collection.name === name);

describe('modeCollections, the modes index the theme exports', () => {
  it('lists every Theme collection and the Button, Badge, Form Field, Checkbox, Switch, Radio, Tabs, Select, Accordion, Divider, Icon Button, Svg Icon, Avatar, Avatar Group and Avatar Label sizes in token-file order, without Core or Structure', () => {
    expect(modeCollections.map((collection) => [collection.name, collection.attrName])).toEqual([
      ['Theme / Brand', 'cck-brand'],
      ['Theme / Color', 'cck-color-mode'],
      ['Theme / Active Color', 'cck-color'],
      ['Theme / Typography', 'cck-typography'],
      ['Theme / Spacing', 'cck-spacing'],
      ['Theme / Radius', 'cck-radius'],
      ['Theme / Border Width', 'cck-border-width'],
      ['Theme / Opacity', 'cck-opacity'],
      ['Theme / Shadow', 'cck-shadow'],
      ['Button / Size', 'size'],
      ['Badge / Size', 'size'],
      ['Form Field / Size', 'size'],
      ['Checkbox / Size', 'size'],
      ['Switch / Size', 'size'],
      ['Radio / Size', 'size'],
      ['Tabs / Size', 'size'],
      ['Select / Size', 'size'],
      ['Accordion / Size', 'size'],
      ['Divider / Size', 'size'],
      ['Icon Button / Size', 'size'],
      ['Svg Icon / Size', 'size'],
      ['Avatar / Size', 'size'],
      ['Avatar Group / Size', 'size'],
      ['Avatar Label / Size', 'size'],
    ]);
  });

  it('gives the color mode, the active color and the button size with their values and defaults', () => {
    expect(byName('Theme / Color')).toEqual({
      name: 'Theme / Color',
      attrName: 'cck-color-mode',
      modes: [
        { name: 'Light', value: 'light' },
        { name: 'Dark', value: 'dark' },
      ],
      defaultMode: 'Light',
    });
    expect(byName('Theme / Active Color')?.modes).toHaveLength(7);
    expect(byName('Theme / Active Color')?.defaultMode).toBe('brand');
    expect(byName('Button / Size')).toMatchObject({ attrName: 'size', componentName: 'button', defaultMode: 'md' });
    expect(byName('Badge / Size')).toMatchObject({ attrName: 'size', componentName: 'badge', defaultMode: 'md' });
    expect(byName('Form Field / Size')).toMatchObject({
      attrName: 'size',
      componentName: 'form-field',
      defaultMode: 'md',
    });
  });

  it('holds no docs field', () => {
    for (const collection of modeCollections) {
      expect(Object.keys(collection).sort()).toEqual(
        [
          'attrName',
          'defaultMode',
          'modes',
          'name',
          ...('componentName' in collection ? ['componentName'] : []),
        ].sort(),
      );
    }
  });

  it('names the attributes and values the built CSS selects on', () => {
    for (const collection of modeCollections.filter((item) => item.modes.length > 1)) {
      for (const mode of collection.modes) {
        // The compiler keeps the quotes of a value that is not an identifier, such as 2xl.
        const value = /^[a-z][\w-]*$/.test(mode.value) ? mode.value : `"${mode.value}"`;
        expect(tokensCss).toContain(`[data-${collection.attrName}=${value}]`);
      }
    }
  });

  it('agrees with the ThemeConfig options that use a collection', () => {
    const { button, badge } = cocokitsThemeConfig.components;
    expect(button.color.attrName).toBe(byName('Theme / Active Color')?.attrName);
    expect(badge.color.attrName).toBe(byName('Theme / Active Color')?.attrName);
    expect(button.size.values).toEqual(byName('Button / Size')?.modes.map((mode) => mode.value));
    expect(badge.size.values).toEqual(byName('Badge / Size')?.modes.map((mode) => mode.value));
  });
});

describe('cocokitsThemeConfig.modeCollections', () => {
  it('is the modes index, so the portal host can mirror the page modes', () => {
    expect(cocokitsThemeConfig.modeCollections).toBe(modeCollections);
    const pageAttrs = modeCollections.filter((collection) => !collection.componentName).map((c) => c.attrName);
    expect(pageAttrs).toContain('cck-color-mode');
    expect(pageAttrs).toContain('cck-brand');
  });
});
