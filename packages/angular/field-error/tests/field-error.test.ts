import { signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { fieldErrorAnatomy } from '@cocokits/machines/field-error';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { CckFieldError, CckFieldErrorImports } from '../index';

const imports = [...CckFieldErrorImports];

describe('CckFieldError', () => {
  it('renders the meta default element, the class, a polite live region and no role', async () => {
    const { container } = await render(`<cck-field-error>Oops</cck-field-error>`, { imports });
    const error = container.querySelector('.cck-field-error');
    expect(error?.tagName.toLowerCase()).toBe('cck-field-error');
    expect(error?.className).toBe(fieldErrorAnatomy.classes.root);
    expect(error?.getAttribute('aria-live')).toBe('polite');
    expect(error?.hasAttribute('role')).toBe(false);
    expect(error?.textContent).toBe('Oops');
  });

  it('shows the content outside a field, and follows force there too', async () => {
    const force = signal(false);
    const { container, fixture } = await render(`<cck-field-error [force]="force()">Oops</cck-field-error>`, {
      imports,
      componentProperties: { force },
    });
    expect(container.querySelector('.cck-field-error')?.textContent).toBe('Oops');
    force.set(true);
    await fixture.whenStable();
    expect(container.querySelector('.cck-field-error')?.textContent).toBe('Oops');
  });

  it('exports the component under the exportAs name', async () => {
    const { fixture } = await render(`<cck-field-error #e="cckFieldError">Oops</cck-field-error>`, { imports });
    expect(fixture.debugElement.children[0]?.injector.get(CckFieldError)).toBeInstanceOf(CckFieldError);
  });

  it('puts the theme attribute on the root', async () => {
    const themeConfig = defineThemeConfig({
      name: 'test',
      components: {
        [fieldErrorAnatomy.block]: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(fieldErrorAnatomy.parts) },
        },
      },
    });
    const { container } = await render(`<cck-field-error>Oops</cck-field-error>`, {
      imports,
      providers: [provideCckTheme(themeConfig)],
    });
    expect(container.querySelector('.cck-field-error')?.getAttribute('data-probe')).toBe('on');
  });
});
