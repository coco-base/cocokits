import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckIcons, provideCckTheme } from '@cocokits/angular-core';
import { plusIcon } from '@cocokits/icons';
import { accordionAnatomy, accordionMeta } from '@cocokits/machines/accordion';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it, vi } from 'vitest';
import { CckAccordionImports } from '../index';
import { must } from './queries';

const imports = [...CckAccordionImports];
const { classes } = accordionAnatomy;

const themeConfig = defineThemeConfig({
  name: 'test',
  components: { accordion: { icons: { indicator: 'plus' } } },
});
const registry = provideCckIcons({ icons: { plus: plusIcon } });
const themed = [provideCckTheme(themeConfig), registry];

const template = `
  <cck-accordion>
    <cck-accordion-item label="Shipping">Orders leave in two days.</cck-accordion-item>
    <cck-accordion-item label="Returns">Within 30 days.</cck-accordion-item>
  </cck-accordion>`;

describe('Accordion indicator', () => {
  it('is the last child of every trigger, decorative, and holds the theme icon', async () => {
    await render(template, { imports, providers: themed });
    const triggers = screen.getAllByRole('button');
    expect(triggers).toHaveLength(2);
    for (const trigger of triggers) {
      const indicator = must(trigger.lastElementChild);
      expect(indicator.tagName.toLowerCase()).toBe(accordionMeta.defaultElements?.indicator);
      expect(indicator.className).toBe(classes.indicator);
      expect(indicator.getAttribute('aria-hidden')).toBe('true');
      const icon = must(indicator.querySelector('.cck-svg-icon'));
      expect(icon.getAttribute('data-icon')).toBe('plus');
      expect(icon.querySelectorAll('path')).toHaveLength(1);
      expect(trigger.querySelectorAll(`.${classes.indicator}`)).toHaveLength(1);
    }
  });

  it('keeps the accessible name of the trigger, and the icon stays after a change of state', async () => {
    const user = userEvent.setup();
    await render(template, { imports, providers: themed });
    const trigger = screen.getByRole('button', { name: 'Shipping' });
    await user.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button', { name: 'Shipping' })).toBe(trigger);
    expect(must(trigger.lastElementChild).querySelector('.cck-svg-icon')).not.toBeNull();
  });

  it('stays the last child with a label template', async () => {
    await render(
      `<cck-accordion>
        <cck-accordion-item><ng-template cckAccordionLabel><b>Shipping</b> info</ng-template>Body</cck-accordion-item>
      </cck-accordion>`,
      { imports, providers: themed },
    );
    const trigger = screen.getByRole('button', { name: 'Shipping info' });
    expect(must(trigger.lastElementChild).className).toBe(classes.indicator);
  });

  it.each([
    ['no theme', []],
    ['a theme with no part icons', [provideCckTheme(defineThemeConfig({ name: 'bare', components: {} }))]],
  ])('holds the default icon: %s', async (_name, providers) => {
    await render(template, { imports, providers });
    const indicator = must(screen.getByRole('button', { name: 'Shipping' }).lastElementChild);
    expect(indicator.className).toBe(classes.indicator);
    expect(indicator.getAttribute('aria-hidden')).toBe('true');
    expect(must(indicator.querySelector('.cck-svg-icon')).getAttribute('data-icon')).toBe('chevron-down');
  });

  it('holds the default icon and reports a theme icon that is not registered', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await render(template, { imports, providers: [provideCckTheme(themeConfig)] });
    const indicator = must(screen.getByRole('button', { name: 'Shipping' }).lastElementChild);
    expect(must(indicator.querySelector('.cck-svg-icon')).getAttribute('data-icon')).toBe('chevron-down');
    await vi.waitFor(() => {
      expect(error).toHaveBeenCalledTimes(2);
    });
    expect(String(error.mock.calls[0]?.[0])).toContain('"plus" for accordion.indicator');
    error.mockRestore();
  });

  it('puts the theme attributes of the indicator part on it', async () => {
    const probe = defineThemeConfig({
      name: 'probe',
      components: {
        accordion: { probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: ['indicator'] } },
      },
    });
    await render(template, { imports, providers: [provideCckTheme(probe)] });
    expect(must(screen.getByRole('button', { name: 'Shipping' }).lastElementChild).getAttribute('data-probe')).toBe(
      'on',
    );
  });
});
