import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { defineAnatomy, defineThemeConfig, type SvgIconSet } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { provideCckTheme, themeIcons, themePartIcon } from '../src/index';

const icons: SvgIconSet = { star: { viewBox: '0 0 24 24', paths: [{ d: 'M0 0' }] } };
const partIconNames = { select: { dropdownIcon: 'star' } };
const themeConfig = defineThemeConfig({ name: 'test', components: {}, icons, partIconNames });

@Component({ selector: 'test-reader', template: `<i data-testid="out">{{ json }}</i>` })
class Reader {
  protected readonly json = JSON.stringify(themeIcons());
}

describe('themeIcons', () => {
  it('returns empty records without a provided theme', async () => {
    await render(Reader);
    expect(screen.getByTestId('out').textContent).toBe('{"icons":{},"partIconNames":{}}');
  });

  it('returns the fields of the provided theme', async () => {
    await render(Reader, { providers: [provideCckTheme(themeConfig)] });
    expect(JSON.parse(screen.getByTestId('out').textContent)).toEqual({ icons, partIconNames });
  });

  it('returns empty records for a theme that has no icon fields', async () => {
    await render(Reader, { providers: [provideCckTheme(defineThemeConfig({ name: 'bare', components: {} }))] });
    expect(screen.getByTestId('out').textContent).toBe('{"icons":{},"partIconNames":{}}');
  });
});

const anatomy = defineAnatomy({
  block: 'select',
  parts: { root: { name: 'Root', description: 'The root.' } },
});
const other = defineAnatomy({ block: 'tabs', parts: { root: { name: 'Root', description: 'The root.' } } });

@Component({
  selector: 'test-part-reader',
  template: `<i data-testid="out">{{ rows }}</i>`,
})
class PartReader {
  protected readonly rows = [
    themePartIcon(anatomy, 'dropdownIcon'),
    themePartIcon(anatomy, 'optionIndicator'),
    themePartIcon(other, 'dropdownIcon'),
    themePartIcon(anatomy, 'constructor'),
  ].join('|');
}

describe('themePartIcon', () => {
  it('reads the icon the theme names for a part of the anatomy block, and nothing else', async () => {
    await render(PartReader, { providers: [provideCckTheme(themeConfig)] });
    expect(screen.getByTestId('out').textContent).toBe('star|||');
  });

  it('is undefined without a theme', async () => {
    await render(PartReader);
    expect(screen.getByTestId('out').textContent).toBe('|||');
  });
});
