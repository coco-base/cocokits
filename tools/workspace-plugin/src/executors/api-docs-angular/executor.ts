import type { ExecutorContext } from '@nx/devkit';
import type { ApiDocsSchema } from '../api-docs-common/schema';
import { runApiDocs } from '../api-docs-common/run';
import { extractAngularApiDocs } from './extract';

/**
 * Writes `<component>.json` (`ApiDoc`) for every Angular entry point of the project into its own
 * `src/generated/api-docs` folder. The API comes from TSDoc only, and the target fails, writing nothing, when a
 * public member of a directive has none (an inherited one included).
 */
export default function apiDocsAngularExecutor(
  options: ApiDocsSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  return runApiDocs(options, context, extractAngularApiDocs);
}
