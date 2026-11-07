import type { ExecutorContext } from '@nx/devkit';
import { resolve } from 'node:path';
import { insideRoot } from '../inside-root';
import { expandOption, projectRootOf } from '../options';
import { writeJsonFiles } from '../write-json';
import type { ApiDocsSchema } from './schema';
import type { ApiDocJson } from './types';

const DEFAULT_OUTPUT = '{workspaceRoot}/dist/api-docs/{projectName}';
const DEFAULT_TSCONFIG = '{projectRoot}/tsconfig.lib.json';

/** One error that lists every problem, so a run reports them all. */
export function problemsError(problems: readonly string[]): Error {
  return new Error(`${String(problems.length)} problem(s):\n${problems.map((p) => `  ${p}`).join('\n')}`);
}

/**
 * Runs an extraction as an executor. Both path options must stay inside the workspace, the `ApiDoc` files replace the
 * JSON of the output folder, and a failure (the extractor throws) is logged and writes nothing.
 */
export function runApiDocs(
  options: ApiDocsSchema,
  context: ExecutorContext,
  extract: (root: string, projectRoot: string, tsConfig: string) => ApiDocJson[],
): Promise<{ success: boolean }> {
  try {
    const outputDir = insideRoot(context.root, expandOption(options.outputDir ?? DEFAULT_OUTPUT, context), 'outputDir');
    const tsConfig = insideRoot(context.root, expandOption(options.tsConfig ?? DEFAULT_TSCONFIG, context), 'tsConfig');
    const projectRoot = resolve(context.root, projectRootOf(context));
    const docs = extract(context.root, projectRoot, tsConfig);
    writeJsonFiles(
      outputDir,
      docs.map((doc) => ({ name: `${doc.component}.json`, data: doc })),
    );
    return Promise.resolve({ success: true });
  } catch (error) {
    console.error(`api-docs: ${error instanceof Error ? error.message : String(error)}`);
    return Promise.resolve({ success: false });
  }
}
