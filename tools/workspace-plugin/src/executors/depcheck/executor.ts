import { PromiseExecutor } from '@nx/devkit';
import * as fs from 'fs';
import * as path from 'path';

import { DepcheckExecutorSchema } from './schema';
import {
  getDepcheckCommand,
  getDepcheckResult,
  getPackageJson,
  logDepcheckDependencies,
  logDepcheckHeader,
  logDepcheckMissing,
  logDepcheckUsing,
} from './utils';
import { Logger } from '../../utils/logger';

const runExecutor: PromiseExecutor<DepcheckExecutorSchema> = async (options) => {
  Logger.header(`Running depcheck`);

  let hasError = false;
  const baseFolders = ['./packages/react', './packages/angular', './packages/common'];

  const libraryPaths = baseFolders.flatMap((baseFolder) => {
    if (!fs.existsSync(baseFolder)) {
      console.warn(`Folder ${baseFolder} does not exist.`);
      return [];
    }

    return fs
      .readdirSync(baseFolder, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => path.join(baseFolder, dirent.name));
  });

  libraryPaths.forEach((folder, index) => {
    const command = getDepcheckCommand(folder);

    if (options.logLevel === 'debug') {
      logDepcheckHeader(folder, `${index + 1}/${libraryPaths.length}`);
      Logger.log(`command: ${command}`);
    }

    const { dependencies, devDependencies, peerDependencies } = getPackageJson(folder);
    const depcheckResult = getDepcheckResult(command);
    const hasMissing = Object.keys(depcheckResult.missing).length > 0;

    if (options.logLevel === 'debug') {
      logDepcheckDependencies('dependencies', dependencies);
      logDepcheckDependencies('devDependencies', devDependencies);
      logDepcheckDependencies('peerDependencies', peerDependencies);
      logDepcheckUsing(depcheckResult.using);
    }
    if (hasMissing) {
      hasError = true;
      if (options.logLevel === 'errorOnly') {
        logDepcheckHeader(folder);
      }
      logDepcheckMissing(depcheckResult.missing, options.logLevel === 'debug');
    }
  });

  if (hasError) {
    return {
      success: false,
    };
  }

  return {
    success: true,
  };
};

export default runExecutor;
