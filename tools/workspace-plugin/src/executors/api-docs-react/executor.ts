import type { ExecutorContext } from '@nx/devkit';
import { runApiDocs } from '../api-docs-common/run';
import type { ApiDocsSchema } from '../api-docs-common/schema';
import { extractReactApiDocs } from './extract';

/**
 * Writes `<component>.json` (`ApiDoc`) for every React entry point of the project into its own
 * `src/generated/api-docs` folder. The API comes from the TypeScript checker and TSDoc only, and the target fails,
 * writing nothing, when a part or a prop declared by CocoKits has no TSDoc.
 */
export default function apiDocsReactExecutor(
  options: ApiDocsSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  return runApiDocs(options, context, extractReactApiDocs);
}
