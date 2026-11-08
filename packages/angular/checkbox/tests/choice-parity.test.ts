import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { checkboxMeta } from '@cocokits/machines/checkbox';
import { radioMeta } from '@cocokits/machines/radio';
import { switchMeta } from '@cocokits/machines/switch';
import { CckRadioImports } from '@cocokits/angular/radio';
import { CckSwitchImports } from '@cocokits/angular/switch';
import { describe, expect, it } from 'vitest';
import { CckCheckboxImports } from '../index';
import { dataNames, expectDefaultElements, must } from './fixtures';

/** A control with every fact on, then disabled: a disabled input cannot hold focus, so the two steps add up. */
@Component({
  imports: [...CckCheckboxImports, ...CckSwitchImports],
  template: `
    <cck-checkbox
      [checked]="true"
      [indeterminate]="true"
      [disabled]="disabled()"
      readonly
      required
      invalid
      pending
      touched
      dirty
      submitted
    >
      Box
    </cck-checkbox>
    <cck-switch [checked]="true" [disabled]="disabled()" readonly required invalid pending touched dirty submitted>
      Toggle
    </cck-switch>
  `,
})
class AllFacts {
  readonly disabled = signal(false);
}

describe('Checkbox, Switch and Radio parts', () => {
  it.each([
    ['cck-checkbox', 'checkbox', checkboxMeta],
    ['cck-switch', 'switch', switchMeta],
    ['cck-radio', 'radio', radioMeta],
  ] as const)('renders the default element of every part of %s', async (selector, block, meta) => {
    const imports = [...CckCheckboxImports, ...CckSwitchImports, ...CckRadioImports];
    const { container } = await render(`<${selector} name="n">Caption</${selector}>`, { imports });
    expectDefaultElements(must(container.querySelector(`.cck-${block}`)), block, meta.defaultElements);
  });

  it('renders exactly the root data attributes of the Checkbox and the Switch meta', async () => {
    const { fixture, container } = await render(AllFacts);
    const [box, toggle] = [...container.querySelectorAll('.cck-checkbox, .cck-switch')];
    const names = (root: Element | undefined): Set<string> => new Set(dataNames(must(root)));
    const first = [names(box), names(toggle)];
    screen.getByRole<HTMLInputElement>('checkbox').focus();
    await fixture.whenStable();
    const focusedBox = names(box);
    screen.getByRole<HTMLInputElement>('switch').focus();
    await fixture.whenStable();
    const focused = [focusedBox, names(toggle)];
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    const all = [names(box), names(toggle)];
    const union = (index: number): string[] => [...new Set([...first[index], ...focused[index], ...all[index]])].sort();
    expect(union(0)).toEqual([...checkboxMeta.dataAttrs.root].sort());
    expect(union(1)).toEqual([...switchMeta.dataAttrs.root].sort());
    expect(union(1)).not.toContain('data-indeterminate');
  });

  it('renders exactly the root data attributes of the Radio meta', async () => {
    const { container } = await render(`<cck-radio name="n" disabled required [checked]="true">Caption</cck-radio>`, {
      imports: [...CckRadioImports],
    });
    expect(dataNames(must(container.querySelector('.cck-radio')))).toEqual([...radioMeta.dataAttrs.root].sort());
  });

  it('renders the types, the switch role and the decorative parts from the machine', async () => {
    const { container } = await render(
      `<cck-checkbox>A</cck-checkbox><cck-switch>B</cck-switch><cck-radio name="n">C</cck-radio>`,
      {
        imports: [...CckCheckboxImports, ...CckSwitchImports, ...CckRadioImports],
      },
    );
    const inputs = [...container.querySelectorAll('input')];
    expect(inputs.map((input) => input.getAttribute('type'))).toEqual(['checkbox', 'checkbox', 'radio']);
    expect(inputs.map((input) => input.getAttribute('role'))).toEqual([null, 'switch', null]);
    const hidden = [...container.querySelectorAll('[aria-hidden]')].map((element) => element.className);
    expect(hidden.sort()).toEqual(
      [
        'cck-checkbox__backdrop',
        'cck-checkbox__background',
        'cck-switch__thumb',
        'cck-switch__backdrop',
        'cck-radio__backdrop',
        'cck-radio__background',
      ].sort(),
    );
  });
});

describe('Keyboard', () => {
  describe.each([
    ['cck-checkbox', 'checkbox'],
    ['cck-switch', 'switch'],
  ])('%s', (selector, role) => {
    const template = (): string =>
      `<${selector} aria-label="A"></${selector}><${selector} aria-label="B" disabled></${selector}><${selector} aria-label="C" readonly></${selector}><${selector} aria-label="D"></${selector}>`;

    it('skips a disabled control with Tab and reaches a read-only one', async () => {
      await render(template(), { imports: [...CckCheckboxImports, ...CckSwitchImports] });
      const user = userEvent.setup();
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole(role, { name: 'A' }));
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole(role, { name: 'C' }));
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole(role, { name: 'D' }));
      await user.tab({ shift: true });
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(screen.getByRole(role, { name: 'A' }));
    });
  });

  describe('Radio', () => {
    const imports = [...CckRadioImports];
    const group = (...radios: string[]): string => `<fieldset>${radios.join('')}</fieldset>`;
    const radio = (label: string, attrs = ''): string => `<cck-radio name="plan" ${attrs}>${label}</cck-radio>`;
    const input = (name: string): HTMLInputElement => screen.getByRole<HTMLInputElement>('radio', { name });

    it('checks the focused radio with Space', async () => {
      await render(group(radio('Free'), radio('Pro')), { imports });
      const user = userEvent.setup();
      await user.tab();
      expect(document.activeElement).toBe(input('Free'));
      expect(input('Free').checked).toBe(false);
      await user.keyboard(' ');
      expect(input('Free').checked).toBe(true);
    });

    it('enters a group at the checked radio', async () => {
      await render(group(radio('Free'), radio('Pro', '[checked]="true"'), radio('Team')), { imports });
      await userEvent.setup().tab();
      expect(document.activeElement).toBe(input('Pro'));
    });

    it('enters a group at the first radio when none is checked', async () => {
      await render(group(radio('Free'), radio('Pro'), radio('Team')), { imports });
      await userEvent.setup().tab();
      expect(document.activeElement).toBe(input('Free'));
    });

    it('tabs past a disabled radio', async () => {
      await render(group(radio('Free', 'disabled'), radio('Pro'), radio('Team')), { imports });
      await userEvent.setup().tab();
      expect(document.activeElement).toBe(input('Pro'));
    });

    it('moves with the arrow keys, wraps at both ends and skips a disabled radio', async () => {
      await render(group(radio('Free', '[checked]="true"'), radio('Pro', 'disabled'), radio('Team')), { imports });
      const user = userEvent.setup();
      await user.tab();
      await user.keyboard('{ArrowDown}');
      expect(input('Team').checked).toBe(true);
      await user.keyboard('{ArrowDown}');
      expect(input('Free').checked).toBe(true);
      await user.keyboard('{ArrowUp}');
      expect(input('Team').checked).toBe(true);
      await user.keyboard('{ArrowLeft}');
      expect(input('Free').checked).toBe(true);
      await user.keyboard('{ArrowRight}');
      expect(input('Team').checked).toBe(true);
    });
  });
});
