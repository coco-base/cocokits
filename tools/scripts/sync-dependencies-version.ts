import * as fs from 'fs';
import * as path from 'path';
import fastGlob from 'fast-glob';
import { log } from 'console';
import { recordForEach } from '../../packages/common/utils/src';

interface Dependencies {
  [key: string]: string;
}

interface PackageJson {
  dependencies?: Dependencies;
  devDependencies?: Dependencies;
  peerDependencies?: Dependencies;
}

export async function syncDependenciesVersion() {
  const rootPackageJsonString = fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf-8');
  const rootPackageJson: PackageJson = JSON.parse(rootPackageJsonString);
  const dependencies = {
    ...rootPackageJson.dependencies,
    ...rootPackageJson.devDependencies,
    ...rootPackageJson.peerDependencies,
  };
  const libsPackageJsonString = await fastGlob(`{apps,packages}/**/package.json`, {
    ignore: ['**/node_modules/**'],
  });

  const libsPackageJsonPaths = libsPackageJsonString.forEach((filePath) => {
    const libPackageJsonString = fs.readFileSync(filePath, 'utf-8');
    const libPackageJson: PackageJson = JSON.parse(libPackageJsonString);

    console.log(`\n${filePath}`);
    [
      libPackageJson.dependencies ?? {},
      libPackageJson.devDependencies ?? {},
      libPackageJson.peerDependencies ?? {},
    ].forEach((dependenciesGroup) => {
      recordForEach(dependenciesGroup, (version, dependencyName) => {
        if (dependencyName.includes('@cocokits')) {
          return; // Skip internal dependencies
        }
        if (dependencies[dependencyName] && dependencies[dependencyName] !== version) {
          console.log(`${dependencyName}: ${version} -> ${dependencies[dependencyName]}`);
          dependenciesGroup[dependencyName] = dependencies[dependencyName];
        }
      });
    });

    console.log(`Updated dependencies ...`);
    fs.writeFileSync(filePath, JSON.stringify(libPackageJson, null, 2) + '\n', 'utf-8');
    console.log(`Updated`);
  });
}

syncDependenciesVersion();
