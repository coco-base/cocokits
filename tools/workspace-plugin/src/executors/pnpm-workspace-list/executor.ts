import { spawnSync } from 'child_process';

import { PnpmPackageInfo, PnpmWorkspaceListExecutorSchema } from './schema';
import { Logger } from '../../utils/logger';

export default async function runExecutor(options: PnpmWorkspaceListExecutorSchema) {
  Logger.header('---- cocokits packages list ----');

  const packagesString = spawnSync('pnpm', ['list', '--recursive', '--depth=-1', '--json'], {
    encoding: 'utf-8',
  }).stdout;
  const packages: PnpmPackageInfo[] = JSON.parse(packagesString);

  packages.forEach((localPackage) => {
    if (options.details) {
      Logger.success(localPackage.name);
      Logger.log(`version: ${localPackage.version}`);
      Logger.log(`private: ${localPackage.private}`);
      Logger.log(`path: ${localPackage.path}`);
      Logger.divider();
    } else {
      Logger.success(localPackage.name);
    }
  });

  return {
    success: true,
  };
}
