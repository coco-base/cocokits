import { readFileSync } from 'fs';
import path from 'path';

export function getExternalPackages(dirName: string) {
  // Read package.json
  const packageJsonPath = path.resolve(dirName, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

  // Extract dependencies and peerDependencies
  const dependencies = Object.keys(packageJson.dependencies || {});
  const peerDependencies = Object.keys(packageJson.peerDependencies || {});

  // Combine dependencies and peerDependencies into a single list
  const externalPackages = [...dependencies, ...peerDependencies];

  return externalPackages;
}
