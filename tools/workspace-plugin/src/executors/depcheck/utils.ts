import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { Logger } from '../../utils/logger';

export function logDepcheckHeader(folder: string, index?: string) {
  Logger.empty();
  Logger.divider(index ? `[${index}]: ${folder}` : folder);
  Logger.empty();
}

export function logDepcheckDependencies(title: string, packages: Record<string, any>) {
  Logger.note(title);
  Logger.log('  ' + Object.keys(packages).join('\n  '));
  Logger.empty();
}

export function logDepcheckUsing(using: string[]) {
  Logger.note(`Using:`);
  Logger.warning('  ' + Object.keys(using).join('\n  '));
  Logger.empty();
}

export function logDepcheckMissing(missing: Record<string, string[]>, withDetails: boolean) {
  Logger.note(`Missing:`);
  Object.entries(missing).forEach(([packageName, paths]: [string, string[]]) => {
    Logger.error(`  ${packageName}:`);
    if (withDetails) {
      paths.forEach((p) => Logger.log(`    - ${p.replaceAll('\\', '/').split('/cocokits/').at(-1)}`));
    }
  });
}

export function getDepcheckCommand(folder: string) {
  return `pnpm depcheck ${folder} --ignore-patterns=*.json,vite.config.ts,*.spec.*,*.test.* --json --quiet`;
}

export function getDepcheckResult(command: string) {
  const resultStr = spawnSync(command, { encoding: 'utf8', shell: true });

  if (resultStr.error) {
    Logger.error(`Error running command ${command}: ${resultStr.error}`);
    return null;
  }

  try {
    const results = JSON.parse(resultStr.stdout);
    return results;
  } catch (error) {
    Logger.error(`Failed to parse JSON for ${error}`);
    return null;
  }
}

export function getPackageJson(folder: string) {
  const packageJsonStr = fs.readFileSync(path.join(folder, 'package.json'), 'utf-8');

  try {
    const packageJson = JSON.parse(packageJsonStr);

    return {
      dependencies: packageJson.dependencies ?? {},
      devDependencies: packageJson.devDependencies ?? {},
      peerDependencies: packageJson.peerDependencies ?? {},
    };
  } catch (error) {
    throw new Error(`Failed to parse package.json for ${folder}`, error);
  }
}
