import * as fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const printError = (message: string, err: any): void => {
  if (!`${err}`.includes('No such file or directory')) {
    console.error(`${err}`);
  }
};

// Read the pnpm-workspace.yaml file
const workspaceConfig: string = fs.readFileSync('pnpm-workspace.yaml', 'utf8');

// Regular expression to find package patterns
const packagePatternRegex: RegExp = /-\s*'([^']+)'/g;

// Extract package patterns
let match: RegExpExecArray | null;
const packagePatterns: string[] = [];
while ((match = packagePatternRegex.exec(workspaceConfig)) !== null) {
  packagePatterns.push(match[1]);
}

// Function to delete node_modules directory
const deleteNodeModules = (path: string): void => {
  console.log(`Deleting node_modules in ${path}`);
  try {
    execSync(`npx rimraf ${path}/node_modules`);
  } catch (error) {
    printError(`Error deleting node_modules in ${path}`, error);
  }
};

// Find all libraries directories inside of giver directory that contains project.json
const scanForProjectJson = (rootDir: string, level = 0, maxLevel = 4): string[] => {
  const result: string[] = [];
  if (level > maxLevel) return result;
  const items = fs.readdirSync(rootDir, { withFileTypes: true });
  if (items.find((item) => item.isFile() && item.name === 'project.json')) {
    result.push(rootDir);
    return result;
  }
  for (const item of items) {
    if (item.isDirectory()) {
      result.push(...scanForProjectJson(path.join(rootDir, item.name), level + 1, maxLevel));
    }
  }
  return result;
};

const staticFile = ['tmp', 'dist', 'package-lock.json', 'pnpm-lock.yaml', '.nx', '.angular', 'node_modules'];

staticFile.forEach((filePath) => {
  console.log(`Deleting ${filePath}`);
  try {
    execSync(`npx rimraf ${filePath}`, { stdio: 'pipe' });
  } catch (error) {
    // Try alternative deletion methods for Windows
    try {
      console.log(`-> Delete failed with 'rimraf'. Switch to widows native delete`);
      execSync(`taskkill /f /im node.exe`, { stdio: 'pipe' });
      execSync(`Remove-Item ${filePath} -Recurse -Force`, { stdio: 'pipe' });
    } catch (secondError) {
      printError(`Error deleting ${filePath}`, error);
    }
  }
});

// Iterate over each package and delete its node_modules
packagePatterns.forEach((packagePattern: string) => {
  const packagePath: string = packagePattern.replace('**', '');
  if (!fs.existsSync(packagePath)) {
    console.log(`No such directory exists. Skip cleaning for this directory: ${packagePath}`);
    return;
  }

  const directories = scanForProjectJson(packagePath);
  directories.forEach(deleteNodeModules);
});

console.log('');

console.log('\nWorkspace has been cleaned.\nNow you can run `pnpm i`\n');
