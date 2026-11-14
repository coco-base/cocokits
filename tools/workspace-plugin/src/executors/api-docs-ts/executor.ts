import type { ExecutorContext } from '@nx/devkit';
import { runApiDocs } from '../api-docs-common/run';
import type { ApiDocsSchema } from '../api-docs-common/schema';
import { extractTsApiDocs } from './extract';

/**
 * Writes `<module>.json` (`ApiDoc`, framework `ts`) for every module of a framework-free package (`cdk`, `utils`) into
 * its own `dist/api-docs/<project>` folder. The API comes from the TypeScript checker and TSDoc only, and the target
 * fails, writing nothing, when an export has no TSDoc or breaks a text rule.
 */
export default function apiDocsTsExecutor(
  options: ApiDocsSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  return runApiDocs(options, context, extractTsApiDocs);
}
