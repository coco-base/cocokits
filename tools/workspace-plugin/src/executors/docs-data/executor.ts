import type { ExecutorContext } from '@nx/devkit';
import { resolve } from 'node:path';
import { insideRoot } from '../inside-root';
import { expandOption, projectRootOf } from '../options';
import { writeJsonFiles, type JsonFile } from '../write-json';
import { machinesDocsData } from './machines';
import type { DocsDataSchema } from './schema';
import { themeDocsData } from './theme';

const DEFAULT_OUTPUT = '{projectRoot}/src/generated/docs-data';

function build(options: DocsDataSchema, context: ExecutorContext, projectRoot: string): JsonFile[] {
  if (options.source === 'machines') return machinesDocsData(context.root, projectRoot);
  return themeDocsData(context.root, projectRoot);
}

/**
 * Writes the docs data of a project into its own `src/generated/docs-data` folder: one `ComponentDocData` file per
 * component for `source: "machines"`, and `theme.json` (`ThemeDocData`) for `source: "theme"`. It reads the built
 * package, so the project's `build` runs first. Any error is printed and fails the target before a file is written.
 */
export default function docsDataExecutor(
  options: DocsDataSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  try {
    const outputDir = insideRoot(context.root, expandOption(options.outputDir ?? DEFAULT_OUTPUT, context), 'outputDir');
    const projectRoot = resolve(context.root, projectRootOf(context));
    writeJsonFiles(outputDir, build(options, context, projectRoot));
    return Promise.resolve({ success: true });
  } catch (error) {
    console.error(`docs-data: ${error instanceof Error ? error.message : String(error)}`);
    return Promise.resolve({ success: false });
  }
}
