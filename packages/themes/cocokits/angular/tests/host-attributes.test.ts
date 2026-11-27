import { render } from '@testing-library/angular';
import { CckAccordionImports } from '@cocokits/angular/accordion';
import { CckAvatarImports } from '@cocokits/angular/avatar';
import { CckAvatarGroupImports } from '@cocokits/angular/avatar-group';
import { CckAvatarLabelImports } from '@cocokits/angular/avatar-label';
import { CckBadgeImports } from '@cocokits/angular/badge';
import { CckButtonImports } from '@cocokits/angular/button';
import { CckCheckboxImports } from '@cocokits/angular/checkbox';
import { CckChipImports } from '@cocokits/angular/chip';
import { CckChipListImports } from '@cocokits/angular/chip-list';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckIconButtonImports } from '@cocokits/angular/icon-button';
import { CckRadioImports } from '@cocokits/angular/radio';
import { CckRadioGroupImports } from '@cocokits/angular/radio-group';
import { CckSelectImports } from '@cocokits/angular/select';
import { CckSvgIconImports } from '@cocokits/angular/svg-icon';
import { CckSwitchImports } from '@cocokits/angular/switch';
import { CckTabNavImports } from '@cocokits/angular/tab-nav';
import { CckTabsImports } from '@cocokits/angular/tabs';
import { CckTagImports } from '@cocokits/angular/tag';
import { CckTextareaImports } from '@cocokits/angular/textarea';
import { describe, expect, it, vi } from 'vitest';
import {
  CckAccordionTheme,
  CckAvatarGroupTheme,
  CckAvatarLabelTheme,
  CckAvatarTheme,
  CckBadgeTheme,
  CckButtonTheme,
  CckCheckboxTheme,
  CckChipListTheme,
  CckChipTheme,
  CckFormFieldTheme,
  CckIconButtonTheme,
  CckRadioGroupTheme,
  CckRadioTheme,
  CckSelectTheme,
  CckSvgIconTheme,
  CckSwitchTheme,
  CckTabNavTheme,
  CckTabsTheme,
  CckTagTheme,
  CckTextareaTheme,
} from '../src/index';
import { providers } from './helpers';

/**
 * No theme directive keeps an option as an attribute on its host: a static attribute on a tag makes the input and
 * is also written to the element, unless the directive nulls it. Each row is one host with the options written as
 * static attributes. The checks are the attribute names as the DOM lowercases them. A host that is a native element
 * keeps the options that are native attributes of it: `size` of an `input` and `size` and `color` of an `hr`.
 */
const rows = [
  {
    host: 'cck-accordion',
    imports: [...CckAccordionImports, CckAccordionTheme],
    markup: '<cck-accordion variant="group" size="sm" togglePosition="before" hideToggle></cck-accordion>',
    check: ['variant', 'size', 'toggleposition', 'hidetoggle'],
  },
  {
    host: 'cck-avatar',
    imports: [...CckAvatarImports, CckAvatarTheme],
    markup: '<cck-avatar size="lg" color="info" shape="square"></cck-avatar>',
    check: ['size', 'color', 'shape'],
  },
  {
    host: 'cck-avatar-group',
    imports: [...CckAvatarGroupImports, CckAvatarGroupTheme],
    markup: '<cck-avatar-group size="lg"></cck-avatar-group>',
    check: ['size'],
  },
  {
    host: 'cck-avatar-label',
    imports: [...CckAvatarLabelImports, CckAvatarLabelTheme],
    markup: '<cck-avatar-label size="lg" avatarPosition="top" labelAlignment="horizontal"></cck-avatar-label>',
    check: ['size', 'avatarposition', 'labelalignment'],
  },
  {
    host: 'cck-badge',
    imports: [...CckBadgeImports, CckBadgeTheme],
    markup: '<cck-badge content="3" variant="rectangle" color="danger" size="lg"></cck-badge>',
    check: ['variant', 'color', 'size'],
  },
  {
    host: 'button',
    imports: [...CckButtonImports, CckButtonTheme],
    markup: '<button cckButton variant="outline" color="danger" size="lg">Go</button>',
    check: ['variant', 'color', 'size'],
  },
  {
    host: 'a',
    imports: [...CckButtonImports, CckButtonTheme],
    markup: '<a cckButton href="#go" variant="basic" color="info" size="sm" disabled>Go</a>',
    check: ['variant', 'color', 'size', 'disabled'],
  },
  {
    host: 'cck-checkbox',
    imports: [...CckCheckboxImports, CckCheckboxTheme],
    markup: '<cck-checkbox aria-label="x" size="lg" color="info" labelPosition="before"></cck-checkbox>',
    check: ['size', 'color', 'labelposition'],
  },
  {
    host: 'cck-chip',
    imports: [...CckChipImports, CckChipTheme],
    markup: '<cck-chip size="lg">Pizza</cck-chip>',
    check: ['size'],
  },
  {
    host: 'cck-chip-list',
    imports: [...CckChipListImports, CckChipListTheme],
    markup: '<cck-chip-list aria-label="x" size="lg"></cck-chip-list>',
    check: ['size'],
  },
  {
    host: 'cck-form-field',
    imports: [...CckFormFieldImports, CckFormFieldTheme],
    markup: '<cck-form-field size="lg" width="md"></cck-form-field>',
    check: ['size', 'width'],
  },
  {
    host: 'button',
    imports: [...CckIconButtonImports, CckIconButtonTheme],
    markup: '<button cckIconButton aria-label="x" variant="basic" color="info" size="sm" rounded></button>',
    check: ['variant', 'color', 'size', 'rounded'],
  },
  {
    host: 'cck-radio',
    imports: [...CckRadioImports, CckRadioTheme],
    markup: '<cck-radio aria-label="x" size="lg" color="info" labelPosition="before"></cck-radio>',
    check: ['size', 'color', 'labelposition'],
  },
  {
    host: 'cck-radio-group',
    imports: [...CckRadioGroupImports, CckRadioGroupTheme],
    markup: '<cck-radio-group aria-label="x" size="lg" color="info" labelPosition="before"></cck-radio-group>',
    check: ['size', 'color', 'labelposition'],
  },
  {
    host: 'cck-select',
    imports: [...CckSelectImports, CckSelectTheme],
    markup: '<cck-select aria-label="x" size="lg" indicator="checkbox"></cck-select>',
    check: ['size', 'indicator'],
  },
  {
    host: 'cck-svg-icon',
    imports: [...CckSvgIconImports, CckSvgIconTheme],
    markup: '<cck-svg-icon iconName="check" size="lg" color="info" rtlMirror></cck-svg-icon>',
    check: ['size', 'color', 'rtlmirror'],
  },
  {
    host: 'cck-switch',
    imports: [...CckSwitchImports, CckSwitchTheme],
    markup: '<cck-switch aria-label="x" variant="rail" size="lg" color="info" labelPosition="before"></cck-switch>',
    check: ['variant', 'size', 'color', 'labelposition'],
  },
  {
    host: 'nav',
    imports: [...CckTabNavImports, CckTabNavTheme],
    markup: '<nav cckTabNav aria-label="x" variant="line" color="info" size="lg" headerAlign="center"></nav>',
    check: ['variant', 'color', 'size', 'headeralign'],
  },
  {
    host: 'cck-tabs',
    imports: [...CckTabsImports, CckTabsTheme],
    markup: '<cck-tabs aria-label="x" variant="line" color="info" size="lg" headerAlign="center"></cck-tabs>',
    check: ['variant', 'color', 'size', 'headeralign'],
  },
  {
    host: 'cck-tag',
    imports: [...CckTagImports, CckTagTheme],
    markup: '<cck-tag variant="solid" color="info" size="lg" dot>Paid</cck-tag>',
    check: ['variant', 'color', 'size', 'dot'],
  },
  {
    host: 'textarea',
    imports: [...CckTextareaImports, CckTextareaTheme],
    markup: '<textarea cckTextarea aria-label="x" size="lg" autoResize resize="both"></textarea>',
    check: ['size', 'autoresize', 'resize'],
  },
];

describe('theme directives keep no option as an attribute', () => {
  it.each(rows)('$host with $check', async ({ host, imports, markup, check }) => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(markup, { imports, providers });
    const element = document.querySelector(host);
    expect(element, host).not.toBeNull();
    expect(
      check.filter((name) => element?.hasAttribute(name) === true),
      host,
    ).toEqual([]);
  });

  it('still renders the data attributes of the option, and the native attribute of a native host stays', async () => {
    await render('<textarea cckTextarea aria-label="x" size="lg" resize="both"></textarea>', {
      imports: [...CckTextareaImports, CckTextareaTheme],
      providers,
    });
    const textarea = document.querySelector('textarea');
    expect(textarea?.getAttribute('data-size')).toBe('lg');
    expect(textarea?.getAttribute('data-resize')).toBe('both');
  });
});
