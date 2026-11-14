// @vitest-environment node
/// <reference types="node" />
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'tsdown';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const packageRoot = fileURLToPath(new URL('../../../', import.meta.url));
let outDir = '';
const emitted = new Map<string, string>();

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)])),
  );
  return nested.flat();
}

beforeAll(async () => {
  outDir = await mkdtemp(join(tmpdir(), 'cck-react-'));
  await build({
    config: false,
    cwd: packageRoot,
    entry: ['src/*/index.{ts,tsx}'],
    root: 'src',
    format: 'esm',
    platform: 'neutral',
    target: 'es2022',
    unbundle: true,
    dts: false,
    hash: false,
    fixedExtension: false,
    clean: false,
    outDir,
    tsconfig: 'tsconfig.lib.json',
    logLevel: 'silent',
  });
  for (const file of await walk(outDir)) {
    if (file.endsWith('.js')) emitted.set(relative(outDir, file).split(sep).join('/'), await readFile(file, 'utf8'));
  }
}, 60_000);

afterAll(async () => {
  await rm(outDir, { recursive: true, force: true });
});

const startsWithDirective = (code: string): boolean => /^["']use client["'];?/.test(code.trimStart());

describe('emitted modules keep their "use client"', () => {
  it('has the directive first in every module that defines a component or hook', () => {
    expect(startsWithDirective(emitted.get('button/button.js') ?? '')).toBe(true);
    expect(startsWithDirective(emitted.get('internal/use-merged-ref.js') ?? '')).toBe(true);
  });

  it('has it in no barrel and no pure module', () => {
    const withDirective = [...emitted].filter(([, code]) => startsWithDirective(code)).map(([name]) => name);
    expect(withDirective.sort()).toEqual([
      'accordion/accordion-content.js',
      'accordion/accordion-context.js',
      'accordion/accordion-header.js',
      'accordion/accordion-item.js',
      'accordion/accordion-root.js',
      'accordion/accordion-trigger.js',
      'badge-container/badge-container.js',
      'badge/badge.js',
      'button/button.js',
      'checkbox/checkbox.js',
      'dialog/dialog-close.js',
      'dialog/dialog-content.js',
      'dialog/dialog-context.js',
      'dialog/dialog-description.js',
      'dialog/dialog-root.js',
      'dialog/dialog-title.js',
      'dialog/dialog-trigger.js',
      'divider/divider.js',
      'field-error/field-error.js',
      'form-field/form-field.js',
      'hint/hint.js',
      'icon-button/icon-button.js',
      'input/input.js',
      'internal/button-kind.js',
      'internal/dismiss-layer-context.js',
      'internal/form-field-context.js',
      'internal/overlay-arrow.js',
      'internal/radio-group-context.js',
      'internal/use-button-element.js',
      'internal/use-checked-state.js',
      'internal/use-choice-control.js',
      'internal/use-controllable-state.js',
      'internal/use-field-control.js',
      'internal/use-isomorphic-layout-effect.js',
      'internal/use-merged-ref.js',
      'internal/use-modal-at-open.js',
      'internal/use-part-icon.js',
      'internal/use-positioning-options.js',
      'internal/use-text-control.js',
      'internal/use-trigger-warning.js',
      'internal/use-unnamed-warning.js',
      'label/label.js',
      'leading/leading.js',
      'popover/popover-anchor.js',
      'popover/popover-arrow.js',
      'popover/popover-close.js',
      'popover/popover-content.js',
      'popover/popover-context.js',
      'popover/popover-description.js',
      'popover/popover-root.js',
      'popover/popover-title.js',
      'popover/popover-trigger.js',
      'prefix/prefix.js',
      'radio-group/radio-group.js',
      'radio/radio.js',
      'radio/use-radio-group-item.js',
      'select/select-content.js',
      'select/select-context.js',
      'select/select-form-inputs.js',
      'select/select-group.js',
      'select/select-icon.js',
      'select/select-item-indicator.js',
      'select/select-item-text.js',
      'select/select-item.js',
      'select/select-label.js',
      'select/select-root.js',
      'select/select-separator.js',
      'select/select-trigger.js',
      'select/select-value.js',
      'select/use-select-highlight.js',
      'select/use-select-model.js',
      'select/use-select-part.js',
      'select/use-select-presence.js',
      'select/use-select-registry.js',
      'select/use-select-trigger.js',
      'suffix/suffix.js',
      'svg-icon/svg-icon.js',
      'switch/switch.js',
      'tab-nav/tab-nav-context.js',
      'tab-nav/tab-nav-indicator.js',
      'tab-nav/tab-nav-link.js',
      'tab-nav/tab-nav-list.js',
      'tab-nav/tab-nav-panel.js',
      'tab-nav/tab-nav-root.js',
      'tabs/tabs-content.js',
      'tabs/tabs-context.js',
      'tabs/tabs-indicator.js',
      'tabs/tabs-list.js',
      'tabs/tabs-root.js',
      'tabs/tabs-trigger.js',
      'textarea/textarea.js',
      'tooltip/tooltip-arrow.js',
      'tooltip/tooltip-content.js',
      'tooltip/tooltip-context.js',
      'tooltip/tooltip-provider-context.js',
      'tooltip/tooltip-provider.js',
      'tooltip/tooltip-root.js',
      'tooltip/tooltip-trigger.js',
      'trailing/trailing.js',
    ]);
    expect(emitted.has('button/index.js')).toBe(true);
  });
});
