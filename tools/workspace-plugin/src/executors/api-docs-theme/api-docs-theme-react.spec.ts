import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { posix } from '../posix-path';
import { REPO, scratchArea } from '../api-docs-common/testing/scratch';
import type { ApiDocJson } from '../api-docs-common/types';
import { baseDocFiles, type FixturePart } from './testing/base-docs';
import executor from './executor';
import { extractThemeApiDocs } from './extract';

const area = scratchArea('api-docs-theme-react');

const TSCONFIG = {
  compilerOptions: {
    jsx: 'react-jsx',
    strict: true,
    types: [],
    noEmit: true,
    paths: { '@cocokits/react/*': ['../base/*'] },
    exactOptionalPropertyTypes: true,
  },
  include: ['**/*.ts', '**/*.tsx'],
};

const BASE: FixturePart[] = [
  { id: 'dialog.root' },
  { id: 'dialog.content' },
  { id: 'dialog.trigger' },
  { id: 'button.root' },
];

const BASE_DIALOG = `
import type { ReactElement } from 'react';

/** Props of the dialog root. */
export interface DialogRootProps {
  /** Whether the dialog is open. */
  readonly open?: boolean | undefined;
}
/** Props of the dialog content. */
export interface DialogContentProps {
  /** The accessible label. */
  readonly label?: string | undefined;
}
const Root = (_props: DialogRootProps): ReactElement => null as never;
const Content = (_props: DialogContentProps): ReactElement => null as never;
const Trigger = (_props: { readonly label?: string | undefined }): ReactElement => null as never;
export const Dialog = { Root, Content, Trigger };
`;

const BASE_BUTTON = `
import type { ReactElement } from 'react';
export const Button = (_props: { readonly label?: string | undefined }): ReactElement => null as never;
`;

const DIALOG_ROOT = `
import type { ReactElement } from 'react';
import { Dialog as BaseDialog, type DialogRootProps as BaseDialogRootProps } from '@cocokits/react/dialog';

/** The size values. */
export type DialogSize = 'sm' | 'lg';

/** Props of the themed root. */
export interface DialogRootProps extends BaseDialogRootProps {
  /** Width of the window. */
  readonly size?: DialogSize | null | undefined;
}

function ThemedDialogRoot({ size: _size, ...props }: DialogRootProps): ReactElement {
  return <BaseDialog.Root {...props} />;
}

/** The themed root component. */
export interface DialogRootComponent {
  (props: DialogRootProps): ReactElement;
  displayName: string;
}

/**
 * The themed root.
 *
 * @cckPart root
 */
export const DialogRoot: DialogRootComponent = Object.assign(ThemedDialogRoot, { displayName: 'Dialog.Root' });
`;

const DIALOG_CONTENT = `
import type { ReactElement } from 'react';
import { Dialog as BaseDialog, type DialogContentProps } from '@cocokits/react/dialog';

/** The themed content component. */
export interface DialogContentComponent {
  (props: DialogContentProps): ReactElement;
  displayName: string;
}

function ThemedDialogContent(props: DialogContentProps): ReactElement {
  return <BaseDialog.Content {...props} />;
}

/**
 * The themed content, which has no option of its own.
 *
 * @cckPart content
 */
export const DialogContent: DialogContentComponent = Object.assign(ThemedDialogContent, {
  displayName: 'Dialog.Content',
});
`;

const DIALOG = `
import { Dialog as BaseDialog } from '@cocokits/react/dialog';
import { DialogContent } from './dialog-content';
import { DialogRoot } from './dialog-root';

/** The dialog parts. */
export const Dialog = { Root: DialogRoot, Content: DialogContent, Trigger: BaseDialog.Trigger };
`;

const FILES: Record<string, string> = {
  '../base/dialog.ts': BASE_DIALOG,
  '../base/button.ts': BASE_BUTTON,
  'src/dialog-root.tsx': DIALOG_ROOT,
  'src/dialog-content.tsx': DIALOG_CONTENT,
  'src/dialog.ts': DIALOG,
  'src/index.ts': `export { Dialog } from './dialog';\nexport type { DialogRootProps, DialogSize } from './dialog-root';\n`,
};

function extract(name: string, files: Record<string, string> = {}): ApiDocJson[] {
  const { project, tsConfig } = area.create(name, { ...FILES, ...baseDocFiles(BASE), ...files }, TSCONFIG);
  return extractThemeApiDocs('react', 'acme', join(project, '..', 'base'), REPO, project, tsConfig);
}

afterEach(() => {
  area.clean();
});

describe('extractThemeApiDocs, React', () => {
  it('writes one doc with the theme, and the exports as the template writes them, base parts included', () => {
    const [doc, ...more] = extract('doc');
    expect(more).toEqual([]);
    expect(doc).toMatchObject({
      component: 'dialog',
      framework: 'react',
      theme: 'acme',
      exports: ['Dialog.Content', 'Dialog.Root', 'Dialog.Trigger'],
    });
  });

  it('lists the inherited base props with declaredIn base, next to the own prop (an Object.assign export)', () => {
    const root = extract('root')[0]?.parts.find((part) => part.name === 'Dialog.Root');
    expect(root).toMatchObject({ semanticId: 'dialog.root' });
    expect(root?.props.map((prop) => [prop.name, prop.declaredIn]).sort()).toEqual([
      ['open', 'base'],
      ['size', 'theme'],
    ]);
    expect(root?.props.find((prop) => prop.name === 'size')).toMatchObject({
      semanticId: 'dialog.size',
      type: "'sm' | 'lg' | null",
    });
  });

  it('keeps the content a part that declares no member itself', () => {
    const content = extract('content')[0]?.parts.find((part) => part.name === 'Dialog.Content');
    expect(content).toMatchObject({ semanticId: 'dialog.content' });
    expect(content?.props.every((prop) => prop.declaredIn === 'base')).toBe(true);
  });

  it('leaves the re-exported base part out of the parts, and the type exports out of the exports', () => {
    const doc = extract('base-part')[0];
    expect(doc?.parts.map((part) => part.name)).toEqual(['Dialog.Content', 'Dialog.Root']);
    expect(doc?.exports).not.toContain('DialogRootProps');
  });

  it.each([
    [
      'a file that imports no base component',
      {
        'src/dialog-content.tsx': `
import type { ReactElement } from 'react';
/**
 * The themed content.
 *
 * @cckPart content
 */
export const DialogContent = Object.assign((_props: { readonly label?: string }): ReactElement => <div />, {
  displayName: 'Dialog.Content',
});
`,
      },
      'Dialog.Content: its file imports 0 base components',
    ],
    [
      'a file that imports two base components',
      { 'src/dialog-content.tsx': `import { Button } from '@cocokits/react/button';\n${DIALOG_CONTENT}` },
      'Dialog.Content: its file imports 2 base components (button, dialog)',
    ],
    [
      'a part that the base component has no part for',
      { 'src/dialog-content.tsx': DIALOG_CONTENT.replace('@cckPart content', '@cckPart footer') },
      'Dialog.Content: no base part "dialog.footer" in the component "dialog"',
    ],
  ])('fails for %s, with the name of the export', (name, files, message) => {
    expect(() => extract(`fail-${name.replaceAll(' ', '-')}`, files)).toThrow(message);
  });
});

describe('the api-docs-theme executor', () => {
  const run = async (project: string, name: string): Promise<{ success: boolean; out: string }> => {
    const { project: root, tsConfig } = area.create(name, { ...FILES, ...baseDocFiles(BASE) }, TSCONFIG);
    const rel = (path: string): string => posix(path).slice(posix(REPO).length + 1);
    const out = join(root, '..', 'out');
    const context = {
      root: REPO,
      projectName: project,
      projectsConfigurations: { projects: { [project]: { root: rel(root) } } },
    } as never;
    const result = await executor(
      { framework: 'react', outputDir: rel(out), baseDir: rel(join(root, '..', 'base')), tsConfig: rel(tsConfig) },
      context,
    );
    return { ...result, out };
  };

  it('writes <component>.json with the theme taken from the project name', async () => {
    const { success, out } = await run('theme-acme-react', 'exec');
    expect(success).toBe(true);
    expect(readdirSync(out)).toEqual(['dialog.json']);
    expect(JSON.parse(readFileSync(join(out, 'dialog.json'), 'utf8'))).toMatchObject({ theme: 'acme' });
  });

  it('fails and writes nothing for a project that is no theme package of the framework', async () => {
    const { success, out } = await run('theme-acme-vue', 'exec-wrong');
    expect(success).toBe(false);
    expect(existsSync(out)).toBe(false);
  });
});
