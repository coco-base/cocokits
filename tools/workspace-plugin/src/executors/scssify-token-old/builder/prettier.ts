import { execSync } from 'child_process';

import { Logger } from '../../../utils/logger';

/**
 * Runs Prettier to format the content of the given directory.
 * It helps to keep the formatting consistent and avoids the need to manually calculate the indent of each line during file generation.
 *
 * @param dirname - The directory path where all files to be formatted are located.
 */
export function runPrettier(dirname: string) {
  Logger.log('\nRunning prettier to format the generated files\n');
  execSync(`npx prettier --write ${dirname}/**/*`);
}
