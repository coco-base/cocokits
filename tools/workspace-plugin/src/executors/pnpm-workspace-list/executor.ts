import { execSync } from 'child_process';

import { PnpmPackageInfo, PnpmWorkspaceListExecutorSchema } from './schema';
import { Logger } from '../../utils/logger';

export default async function runExecutor(_options: PnpmWorkspaceListExecutorSchema) {
  Logger.header('---- cocokits packages list ----');

  try {
    const packagesJson = execSync('pnpm list --recursive --depth=1 --json', { encoding: 'utf8' });
    const packages: PnpmPackageInfo[] = JSON.parse(packagesJson)
      .filter((pkg: PnpmPackageInfo) => pkg.name !== 'cocokits')
      .map((pkg) => {
        const parts = pkg.path.split('\\cocokits\\');
        const path = parts.length > 1 ? parts[1] : pkg.path;
        return {
          ...pkg,
          path,
        };
      });

    // Define column headers
    const headers = ['Name', 'Scope', 'Version', 'Private'];

    // Calculate maximum width for each column
    const maxWidths = {
      name: Math.max(...packages.map((pkg) => pkg.name.length), headers[0].length),
      scope: Math.max(...packages.map((pkg) => pkg.name.replace('@cocokits/', '').length), headers[1].length),
      version: Math.max(...packages.map((pkg) => (pkg.version || '').length), headers[2].length),
      private: Math.max(...packages.map((pkg) => (pkg.private ? 'Yes' : 'No').length), headers[3].length),
    };

    // Create table header
    const header = [
      headers[0].padEnd(maxWidths.name),
      headers[1].padEnd(maxWidths.scope),
      headers[2].padEnd(maxWidths.version),
      headers[3].padEnd(maxWidths.private),
    ].join(' | ');

    // Create separator line
    const separator = [
      '-'.repeat(maxWidths.name),
      '-'.repeat(maxWidths.scope),
      '-'.repeat(maxWidths.version),
      '-'.repeat(maxWidths.private),
    ].join(' | ');

    Logger.log(header);
    Logger.log(separator);

    // Display packages as table rows
    packages.forEach((pkg) => {
      const row = [
        pkg.name.padEnd(maxWidths.name),
        pkg.name.replace('@cocokits/', '').padEnd(maxWidths.scope),
        (pkg.version || '').padEnd(maxWidths.version),
        (pkg.private ? 'Yes' : 'No').padEnd(maxWidths.private),
      ].join(' | ');

      Logger.log(row);
    });
    return {
      success: true,
    };
  } catch (error) {
    Logger.error(error.message);
    return {
      success: false,
    };
  }
}
