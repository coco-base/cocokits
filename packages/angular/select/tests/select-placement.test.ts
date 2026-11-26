import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selectAnatomy } from '@cocokits/machines/select';
import { CckSelectImports } from '../index';
import { trigger } from './helpers';
import { stubOverlayApis } from './overlay-stubs';

/** The classes of the content at the moment the positioning module starts, which reads its `--side-offset`. */
const classesAtStart = vi.hoisted(() => [] as string[][]);
vi.mock('@cocokits/cdk/positioning', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@cocokits/cdk/positioning')>();
  return {
    ...actual,
    startOverlayPosition: (options: Parameters<typeof actual.startOverlayPosition>[0]) => {
      classesAtStart.push([...(options.getContent()?.classList ?? [])]);
      return actual.startOverlayPosition(options);
    },
  };
});

describe('Select placement', () => {
  beforeEach(() => {
    classesAtStart.length = 0;
    stubOverlayApis();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts the positioning module after the list has its class, so the theme gap applies', async () => {
    await render(
      `<cck-select aria-label="Dish"><cck-select-option value="Cake">Cake</cck-select-option></cck-select>`,
      { imports: [CckSelectImports] },
    );
    await userEvent.click(trigger());
    await vi.waitFor(() => {
      expect(classesAtStart.length).toBeGreaterThan(0);
    });
    for (const classes of classesAtStart) expect(classes).toContain(selectAnatomy.classes.content);
  });
});
