import { describe, expect, it } from 'vitest';
import { cocokitsThemeConfig } from '../src/index';
import { declarationsOf, read, ref, structureTokenOf } from './css-test-helpers';

const styles = read('dist', 'styles.css');

describe('overlay family: one gap, the Popover look (popover-02, -03, -04, -09; menu-01, -03; tooltip)', () => {
  it.each([
    ['.cck-popover__content', 'popover'],
    ['.cck-menu__content', 'menu'],
    ['.cck-tooltip__content', 'tooltip'],
  ])('%s has an 8px side offset', (root, block) => {
    expect(structureTokenOf(root, `${block}-side-offset`)).toBe(ref('spacing-4'));
  });

  it('gives the Popover its look from existing tokens: 12px padding, border/2, shadow-md, radius kept', () => {
    const own = (name: string): string | undefined => structureTokenOf('.cck-popover__content', `popover-${name}`);
    expect(own('padding')).toBe(ref('spacing-5'));
    expect(own('border-color')).toBe(ref('border-2'));
    expect(own('shadow')).toBe(ref('shadow-md'));
    expect(own('radius')).toBe(ref('radius-lg'));
    expect(structureTokenOf('.cck-tooltip__content', 'tooltip-radius')).toBe(ref('radius-sm'));
  });

  it('continues the border along the two sloping sides of the Popover arrow only', () => {
    const own = (name: string): string | undefined => structureTokenOf('.cck-popover__content', `popover-${name}`);
    expect(own('arrow-border-color')).toBe(ref('border-2'));
    expect(own('arrow-border-width')).toBe(ref('size-1'));
    const stroke = declarationsOf(styles, '.cck-popover__arrow svg > *') ?? '';
    expect(stroke).toContain('stroke: var(--cck-popover-arrow-border-color)');
    expect(stroke).toContain('stroke-width: var(--cck-popover-arrow-border-width)');
    // The dash pattern skips the base (the first side) and draws the other two.
    expect(stroke).toMatch(/stroke-dasharray: 0 var\(--cck-popover-arrow-width\) calc\(2 \* hypot\(/);
    expect(stroke).toContain('vector-effect: non-scaling-stroke');
  });
});

describe('form field rows', () => {
  it('fills its container, centres the required marker and keeps a Button zone free of extra inline space', () => {
    const field = read('dist', 'components', 'form-field.css');
    expect(declarationsOf(field, '.cck-form-field')).toContain('inline-size: 100%');
    expect(declarationsOf(read('dist', 'components', 'label.css'), '.cck-label')).toContain('align-items: center');
    expect(
      declarationsOf(styles, '.cck-form-field__wrapper > :is(.cck-leading, .cck-trailing):has(> .cck-button)'),
    ).toContain('padding-inline: 0');
  });
});

describe('plain-words descriptions (avatar-08, badge-04, -05, button-10)', () => {
  const { avatar, badge, button } = cocokitsThemeConfig.components;

  it.each([
    ['avatar color', avatar.color.description, 'Colour of the fallback; the default is contrast.'],
    ['badge color', badge.color.description, 'Seven colours.'],
    ['badge size', badge.size.description, 'Four sizes.'],
    ['badge variant', badge.variant.description, 'Pill or small radius.'],
    ['button color', button.color.description, 'Colour family of the button.'],
    ['radio size', cocokitsThemeConfig.components.radio.size.description, 'Size of the radio.'],
  ])('%s reads %j', (_name, description, expected) => {
    expect(description).toBe(expected);
  });

  it('names no marker attribute in any option description', () => {
    const descriptions = Object.values(cocokitsThemeConfig.components).flatMap((component) =>
      Object.values(component as Record<string, unknown>).flatMap((option) =>
        typeof option === 'object' && option !== null && 'description' in option ? [String(option.description)] : [],
      ),
    );
    expect(descriptions.length).toBeGreaterThan(40);
    for (const description of descriptions) {
      expect(description).not.toContain('data-cck-color');
      expect(description).not.toContain('Active Color marker');
    }
  });
});
