import { signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckTheme } from '@cocokits/angular-core';
import { labelAnatomy, labelMeta } from '@cocokits/machines/label';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckLabel, CckLabelImports } from '../index';

const imports = [...CckLabelImports];

describe('CckLabel', () => {
  it('renders a native label with the anatomy class and passes for and id through', async () => {
    const { container } = await render(`<label cckLabel for="email" id="email-label">Email</label>`, { imports });
    const label = container.querySelector('label');
    expect(label?.className).toBe(labelAnatomy.classes.root);
    expect(label?.tagName.toLowerCase()).toBe(labelMeta.defaultElements?.root);
    expect(label?.htmlFor).toBe('email');
    expect(label?.id).toBe('email-label');
    expect(label?.hasAttribute('style')).toBe(false);
  });

  it('only matches a native label', async () => {
    const { container } = await render(`<span cckLabel>Email</span>`, { imports });
    expect(container.querySelector('.cck-label')).toBeNull();
  });

  it('renders the same outside a FormField and throws nothing', async () => {
    const { container } = await render(`<label cckLabel>Email</label>`, { imports });
    expect(container.querySelector('label.cck-label')?.textContent).toBe('Email');
  });

  it('leaves focus on the input it names when it is clicked', async () => {
    await render(`<label cckLabel for="email">Email address</label><input id="email" />`, { imports });
    await userEvent.setup().click(screen.getByText('Email address'));
    expect(document.activeElement?.id).toBe('email');
  });

  it('names the input it labels', async () => {
    await render(`<label cckLabel for="email">Email address</label><input id="email" />`, { imports });
    expect(screen.getByRole('textbox', { name: 'Email address' })).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = await render(`<label cckLabel for="email">Email address</label><input id="email" />`, {
      imports,
    });
    expect((await axe(container)).violations).toEqual([]);
  });

  it('exports the directive under the exportAs name', async () => {
    const { fixture } = await render(`<label cckLabel #l="cckLabel">Email</label>`, { imports });
    expect(fixture.debugElement.children[0]?.injector.get(CckLabel)).toBeInstanceOf(CckLabel);
  });

  it('puts the theme attribute on the root', async () => {
    const themeConfig = defineThemeConfig({
      name: 'test',
      components: {
        [labelAnatomy.block]: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(labelAnatomy.parts) },
        },
      },
    });
    const { container } = await render(`<label cckLabel>Email</label>`, {
      imports,
      providers: [provideCckTheme(themeConfig)],
    });
    expect(container.querySelector('.cck-label')?.getAttribute('data-probe')).toBe('on');
  });

  it('follows a bound for and leaves the attribute off while there is none', async () => {
    const target = signal<string | undefined>(undefined);
    const { container, fixture } = await render(`<label cckLabel [for]="target()">Email</label>`, {
      imports,
      componentProperties: { target },
    });
    const label = container.querySelector('label');
    expect(label?.hasAttribute('for')).toBe(false);
    target.set('email');
    await fixture.whenStable();
    expect(label?.htmlFor).toBe('email');
  });

  it('renders no for in a field without a CocoKits control, and no marker while the field is not required', async () => {
    const { container } = await render(
      `<cck-form-field><label cckLabel>Email</label><input id="e" /></cck-form-field>`,
      {
        imports: [...imports, ...CckFormFieldImports],
      },
    );
    expect(container.querySelector('label')?.hasAttribute('for')).toBe(false);
    expect(container.querySelector('.cck-label__required-marker')).toBeNull();
  });

  it('renders the required marker as the last child, hidden from assistive technology, while the field is required', async () => {
    const { container } = await render(
      `<cck-form-field required><label cckLabel>Email <b>address</b></label><input id="e" /></cck-form-field>`,
      { imports: [...imports, ...CckFormFieldImports] },
    );
    const marker = container.querySelector('label')?.lastElementChild;
    expect(marker?.tagName.toLowerCase()).toBe(labelMeta.defaultElements?.requiredMarker);
    expect(marker?.className).toBe(labelAnatomy.classes.requiredMarker);
    expect(marker?.getAttribute('aria-hidden')).toBe('true');
    expect(marker?.textContent).toBe('*');
  });
});
