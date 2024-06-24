import { getProjects, offsetFromRoot, ProjectConfiguration, workspaceRoot } from '@nx/devkit';
import fs from 'fs';
import { FsTree } from 'nx/src/generators/tree';
import path from 'path';

interface PackageStoriesGlobOptions {
  packageName: string;
  callerPath: string;
  excludePackages?: string[];
}

interface PackageJson {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
}

export function getPackageStories({
  packageName,
  callerPath,
  excludePackages = [],
}: PackageStoriesGlobOptions): string[] {
  const projects = getAllProjects();
  const projectMetadata = getMetadata(packageName, projects);

  const packageJson: PackageJson = JSON.parse(
    fs.readFileSync(path.resolve(workspaceRoot, projectMetadata.root, 'package.json'), 'utf-8')
  );

  const dependencies = { ...(packageJson.dependencies ?? {}) };
  const rootOffset = offsetFromRoot(callerPath.replace(workspaceRoot, ''));

  const packages = [packageName, ...Object.keys(dependencies)];

  const result = packages
    .filter((pkgName) => pkgName.startsWith('@cocokits/') && !excludePackages.includes(pkgName))
    .flatMap((pkgName) => {
      const storiesGlob = '**/@(index.stories.@(ts|tsx)|*.mdx)';
      const pkgMetadata = getMetadata(pkgName, projects);

      // Make sure the package contains stories. For example '@cocokits/common-utils' don't have any story
      if (fs.existsSync(path.resolve(workspaceRoot, pkgMetadata.root, 'stories'))) {
        return `${rootOffset}${pkgMetadata.root}/stories/${storiesGlob}`;
      }

      return [];
    });

  return result;
}

function getMetadata(packageName: string, allProjects: Map<string, ProjectConfiguration>) {
  const metadata = allProjects.get(packageName);

  if (!metadata) {
    throw new Error(`Project ${packageName} not found in workspace`);
  }

  return metadata;
}

function getAllProjects() {
  const tree = new FsTree(workspaceRoot, false);
  return getProjects(tree);
}
