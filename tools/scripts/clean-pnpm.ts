import * as fs from 'fs';
import { execSync } from 'child_process';

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

const staticFile = ['tmp', 'dist', 'package-lock.json', '.nx', 'pnpm-lock.yaml', '.angular', 'node_modules'];

try {
  staticFile.forEach((path) => {
    console.log(`Deleting ${path}`);
    execSync(`npx rimraf ${path}`);
  });
} catch (error) {
  printError(`Error by deleting`, error);
}

// Iterate over each package and delete its node_modules
packagePatterns.forEach((packagePattern: string) => {
  const packagePath: string = packagePattern.replace('**', '');
  if (!fs.existsSync(packagePath)) {
    console.log(`No such directory exists. Skip cleaning for this directory: ${packagePath}`);
    return;
  }

  const directories: string[] = fs
    .readdirSync(packagePath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => `${packagePath}${dirent.name}`);

  directories.forEach(deleteNodeModules);
});

console.log('');

console.log('\nWorkspace has been cleaned.\nNow you can run `pnpm i`\n');
