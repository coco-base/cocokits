import type { ExecutorContext } from '@nx/devkit';
import { insideRoot } from '../inside-root';
import { expandOption } from '../options';
import { compareApiDocs } from './compare';
import { readApiDocs } from './read';
import type { ApiParitySchema } from './schema';

const DEFAULT_API_DOCS_DIRS = [
  'packages/angular/src/generated/api-docs',
  'packages/react/src/generated/api-docs',
  'packages/vue/src/generated/api-docs',
];

/** Compares the Angular, React and Vue `ApiDoc` files by the rules of `compareApiDocs`. */
export default function apiParityExecutor(
  options: ApiParitySchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  try {
    const apiDocsDirs = (options.apiDocsDirs ?? DEFAULT_API_DOCS_DIRS).map((dir) =>
      insideRoot(context.root, expandOption(dir, context), 'apiDocsDirs'),
    );
    const { docs, problems } = readApiDocs(apiDocsDirs);
    const result = compareApiDocs(docs);
    for (const line of result.reports) console.log(`api-parity: report: ${line}`);
    const failures = [...problems, ...result.failures];
    for (const line of failures) console.error(`api-parity: ${line}`);
    if (failures.length === 0) console.log(`api-parity: ${String(docs.length)} ApiDoc file(s) agree`);
    return Promise.resolve({ success: failures.length === 0 });
  } catch (error) {
    console.error(`api-parity: ${error instanceof Error ? error.message : String(error)}`);
    return Promise.resolve({ success: false });
  }
}
