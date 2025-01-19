import { execSync } from 'child_process';

import { Logger } from '../../../utils/logger';

/**
 * Runs Prettier on a folder path, file path, or a list of paths.
 *
 * @param pattern - A folder path, file path, or an array pattern.
 */
export function runPrettier(...pattern: string[]) {
  Logger.log('\nRunning prettier to format the generated files\n\n');
  execSync(`npx prettier --write ${pattern.join(' ')}`);
}
