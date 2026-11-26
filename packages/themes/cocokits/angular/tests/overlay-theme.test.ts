import { Component, inject, signal, type EnvironmentProviders, type Provider } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckButton } from '@cocokits/angular/button';
import { CckDialog, CckDialogImports } from '@cocokits/angular/dialog';
import { CckSelectImports } from '@cocokits/angular/select';
import { CckTooltipImports } from '@cocokits/angular/tooltip';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CckButtonTheme,
  CckDialogContentTheme,
  CckDialogTheme,
  CckSelectTheme,
  CckTooltipContentTheme,
  CckTooltipTheme,
} from '../src/index';
import { providers } from './helpers';

/** jsdom has no Popover API and no modal dialog: the stubs show a popover and mark a modal dialog as open. */
function stubOverlayApis(): void {
  const matches = Object.getOwnPropertyDescriptor(Element.prototype, 'matches')?.value as (
    this: Element,
    selector: string,
  ) => boolean;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    if (selector === ':modal') return this.localName === 'dialog' && this.hasAttribute('data-modal');
    return matches.call(this, selector);
  });
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    this.style.display = 'block';
  };
  HTMLElement.prototype.hidePopover = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
    this.setAttribute('data-modal', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.removeAttribute('data-modal');
    this.dispatchEvent(new Event('close'));
  };
}

type Value = string | null | undefined;
const { dialog: dialogConfig, tooltip: tooltipConfig } = cocokitsThemeConfig.components;

@Component({
  imports: [...CckDialogImports, CckDialogTheme, CckDialogContentTheme],
  template: `
    <ng-container cckDialog [dialogSize]="$any(size())">
      <button cckDialogTrigger type="button">Open</button>
      <ng-template cckDialogPortal>
        <dialog cckDialogContent><h2 cckDialogTitle>Panel</h2></dialog>
      </ng-template>
    </ng-container>
  `,
})
class DialogHost {
  readonly size = signal<Value>(undefined);
}

@Component({
  imports: [...CckTooltipImports, CckTooltipTheme, CckTooltipContentTheme],
  template: `
    <button [cckTooltipTriggerFor]="richTip" [tooltipSize]="$any(size())" type="button">Copy</button>
    <ng-template #richTip><cck-tooltip-content>Copies the link</cck-tooltip-content></ng-template>
  `,
})
class TooltipHost {
  readonly size = signal<Value>(undefined);
}

interface Overlay {
  readonly name: 'dialog' | 'tooltip';
  readonly host: typeof DialogHost | typeof TooltipHost;
  readonly values: readonly string[];
  readonly defaultSize: string;
  /** Opens the overlay and returns its content element. */
  readonly open: () => Promise<HTMLElement>;
}

const user = (): ReturnType<typeof userEvent.setup> => userEvent.setup();
const overlays: Overlay[] = [
  {
    name: 'dialog',
    host: DialogHost,
    values: dialogConfig.size.values,
    defaultSize: dialogConfig.size.default,
    open: async () => {
      await user().click(screen.getByRole('button', { name: 'Open' }));
      return screen.findByRole('dialog');
    },
  },
  {
    name: 'tooltip',
    host: TooltipHost,
    values: tooltipConfig.size.values,
    defaultSize: tooltipConfig.size.default,
    open: async () => {
      await user().tab();
      return screen.findByRole('tooltip');
    },
  },
];

const override = (
  name: string,
  value: string,
  option = 'size',
): { providers: (Provider | EnvironmentProviders)[] } => ({
  providers: [...providers.slice(1), provideCckTheme(cocokitsThemeConfig, { [name]: { [option]: value } })],
});

describe.each(overlays)('the $name size of the Angular theme (D28, D35, A10)', (overlay) => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('style');
  });

  const mount = async (initial: Value, options: object = { providers }) => {
    const result = await render(overlay.host, { ...options, componentProperties: { size: signal<Value>(initial) } });
    const host = result.fixture.componentInstance;
    return {
      host,
      content: await overlay.open(),
      set: async (value: Value): Promise<void> => {
        host.size.set(value);
        await result.fixture.whenStable();
      },
    };
  };

  it('shows the own size of the root, for every value', async () => {
    const { content, set } = await mount(overlay.values[0]);
    for (const value of overlay.values) {
      await set(value);
      expect(content.getAttribute('data-size')).toBe(value);
    }
  });

  it.each([
    ['with no override', undefined],
    ['with an override', 'lg'],
  ])('shows its own size over the override, %s', async (_name, value) => {
    const { content } = await mount('sm', value ? override(overlay.name, value) : undefined);
    expect(content.getAttribute('data-size')).toBe('sm');
  });

  it('shows the ThemeProvider override when the root sets none, and the default when neither does', async () => {
    expect((await mount(undefined, override(overlay.name, 'lg'))).content.getAttribute('data-size')).toBe('lg');
  });

  it('shows the default when the root and the override set none', async () => {
    expect((await mount(undefined)).content.getAttribute('data-size')).toBe(overlay.defaultSize);
  });

  it.each([
    ['with no override', undefined],
    ['with an override', 'lg'],
  ])('renders no data-size for null, %s', async (_name, value) => {
    const { content, set } = await mount(null, value ? override(overlay.name, value) : undefined);
    expect(content.hasAttribute('data-size')).toBe(false);
    await set('sm');
    expect(content.getAttribute('data-size')).toBe('sm');
    await set(null);
    expect(content.hasAttribute('data-size')).toBe(false);
  });

  it.each([
    ['own size to undefined', 'sm'],
    ['null to undefined', null],
  ])('brings the override back with %s, and the default without one', async (_name, first) => {
    const withOverride = await mount(first, override(overlay.name, 'lg'));
    await withOverride.set(undefined);
    expect(withOverride.content.getAttribute('data-size')).toBe('lg');
  });

  it.each([
    ['own size to undefined', 'sm'],
    ['null to undefined', null],
  ])('brings the default back with %s when there is no override', async (_name, first) => {
    const plain = await mount(first);
    await plain.set(undefined);
    expect(plain.content.getAttribute('data-size')).toBe('md');
  });

  it('writes after the base binding: the theme value is final after the first render and after each change', async () => {
    const { content, set } = await mount('lg', override(overlay.name, 'sm'));
    expect(content.getAttribute('data-size')).toBe('lg');
    await set('sm');
    expect(content.getAttribute('data-size')).toBe('sm');
    await set('lg');
    expect(content.getAttribute('data-size')).toBe('lg');
    await set(undefined);
    expect(content.getAttribute('data-size')).toBe('sm');
  });

  it('renders no theme attribute without a theme provider', async () => {
    const { content } = await mount('lg', {});
    expect(content.hasAttribute('data-size')).toBe(false);
  });
});

@Component({
  imports: [CckButton, CckButtonTheme, ...CckTooltipImports, CckTooltipTheme, CckTooltipContentTheme],
  template: `
    <button
      cckButton
      [cckTooltipTriggerFor]="saved"
      [size]="$any(button())"
      [tooltipSize]="$any(tooltip())"
      type="button"
    >
      Save
    </button>
    <ng-template #saved><cck-tooltip-content>Saved</cck-tooltip-content></ng-template>
  `,
})
class SameElement {
  readonly button = signal<Value>('xs');
  readonly tooltip = signal<Value>('lg');
}

describe('a Button theme and a Tooltip theme on one Angular element', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['xs', 'lg'],
    ['xl', 'sm'],
  ])('keep both sizes: the Button %s and the tooltip content %s', async (button, tooltip) => {
    const { fixture } = await render(SameElement, {
      providers,
      componentProperties: { button: signal<Value>(button), tooltip: signal<Value>(tooltip) },
    });
    const trigger = screen.getByRole('button', { name: 'Save' });
    expect(trigger.getAttribute('data-size')).toBe(button);
    await userEvent.setup().tab();
    const content = await screen.findByRole('tooltip');
    expect(content.getAttribute('data-size')).toBe(tooltip);
    expect(trigger.getAttribute('data-size')).toBe(button);
    fixture.componentInstance.tooltip.set(null);
    await fixture.whenStable();
    expect(content.hasAttribute('data-size')).toBe(false);
    expect(trigger.getAttribute('data-size')).toBe(button);
  });

  it('keeps the Button size in the simple form, whose bubble shows the default (a gap row)', async () => {
    await render(
      `<button cckButton variant="outline" cckTooltip="Saved" size="xl" tooltipSize="sm" type="button">Save</button>`,
      { imports: [CckButton, CckButtonTheme, ...CckTooltipImports, CckTooltipTheme], providers },
    );
    const trigger = screen.getByRole('button', { name: 'Save' });
    expect(trigger.getAttribute('data-size')).toBe('xl');
    expect(trigger.hasAttribute('tooltipsize')).toBe(false);
    await userEvent.setup().hover(trigger);
    // The simple bubble is aria-hidden (a hidden copy of the text describes the trigger): find it by its class.
    await waitFor(() => {
      expect(document.querySelector('.cck-tooltip__content')?.getAttribute('data-size')).toBe('md');
    });
  });
});

@Component({
  template: `<button type="button" (click)="open()">Open</button>`,
})
class ServiceOpener {
  private readonly service = inject(CckDialog);
  open(): void {
    this.service.open(ServiceBody, { ariaLabel: 'Panel' });
  }
}

@Component({ template: `<p>{{ text }}</p>` })
class ServiceBody {
  protected readonly text = 'Body';
}

describe('a Dialog opened by the dialog service', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('style');
  });

  it.each([
    ['the default', providers, 'md'],
    ['the override', override('dialog', 'lg').providers, 'lg'],
  ])('shows %s', async (_name, p, expected) => {
    await render(ServiceOpener, { providers: p, routes: [{ path: '**', children: [] }] });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Open' }));
    expect((await screen.findByRole('dialog')).getAttribute('data-size')).toBe(expected);
  });
});

describe('the Select indicator of the Angular theme', () => {
  beforeEach(stubOverlayApis);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const select = async (indicator: Value, options: object = { providers }) => {
    const host = signal<Value>(indicator);
    const result = await render(
      `<cck-select aria-label="Dish" [indicator]="$any(indicator())" multiple>
         <cck-select-option value="a">A</cck-select-option>
       </cck-select>`,
      {
        imports: [...CckSelectImports, CckSelectTheme],
        componentProperties: { indicator: host },
        ...options,
      },
    );
    await userEvent.setup().click(screen.getByRole('combobox'));
    const content = document.querySelector('.cck-select__content');
    if (!content) throw new Error('the list did not open');
    return {
      content,
      set: async (v: Value) => {
        host.set(v);
        await result.fixture.whenStable();
      },
    };
  };

  it.each(cocokitsThemeConfig.components.select.indicator.values)(
    'renders data-indicator %s on the list',
    async (value) => {
      const { content } = await select(value);
      expect(content.getAttribute('data-indicator')).toBe(value);
    },
  );

  it('renders none by default, takes the override, and removes it with null', async () => {
    expect((await select(undefined)).content.hasAttribute('data-indicator')).toBe(false);
  });

  it('takes the ThemeProvider override when the list sets none', async () => {
    const withOverride = await select(undefined, override('select', 'none', 'indicator'));
    expect(withOverride.content.getAttribute('data-indicator')).toBe('none');
  });

  it('removes the attribute with null and brings the override back with undefined', async () => {
    const { content, set } = await select('checkbox', override('select', 'none', 'indicator'));
    await set(null);
    expect(content.hasAttribute('data-indicator')).toBe(false);
    await set(undefined);
    expect(content.getAttribute('data-indicator')).toBe('none');
  });
});
