import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
import * as semver from 'semver';
import chalk from 'chalk';

interface Dependencies {
  [key: string]: string;
}

interface PackageJson {
  dependencies?: Dependencies;
  devDependencies?: Dependencies;
  peerDependencies?: Dependencies;
}

interface PackageInfo {
  name: string;
  currentVersion: string;
  latestVersion: string;
  type: 'dependencies' | 'devDependencies' | 'peerDependencies';
  updateType: 'major' | 'minor' | 'patch' | 'upToDate';
}

/**
 * Checks all dependencies in package.json for newer versions available on npm
 */
async function checkForPackageUpdates(): Promise<void> {
  const rootPath = process.cwd();
  const packageJsonPath = path.join(rootPath, 'package.json');

  console.log(chalk.bold('Checking for package updates...'));

  try {
    // Read package.json
    const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    const peerDependencies = packageJson.peerDependencies || {};

    // Prepare package info list
    const packagesToCheck: {
      name: string;
      version: string;
      type: 'dependencies' | 'devDependencies' | 'peerDependencies';
    }[] = [];

    Object.entries(dependencies).forEach(([name, version]) => {
      packagesToCheck.push({ name, version, type: 'dependencies' });
    });

    Object.entries(devDependencies).forEach(([name, version]) => {
      packagesToCheck.push({ name, version, type: 'devDependencies' });
    });

    Object.entries(peerDependencies).forEach(([name, version]) => {
      packagesToCheck.push({ name, version, type: 'peerDependencies' });
    });

    // Check for updates
    const results = await Promise.all(
      packagesToCheck.map(async (pkg) => {
        const packageInfo = await getLatestVersion(pkg.name, pkg.version, pkg.type);
        return packageInfo;
      })
    );

    // Group results by update type
    const major: PackageInfo[] = [];
    const minor: PackageInfo[] = [];
    const patch: PackageInfo[] = [];
    const upToDate: PackageInfo[] = [];

    results.forEach((info) => {
      if (info.updateType === 'major') major.push(info);
      else if (info.updateType === 'minor') minor.push(info);
      else if (info.updateType === 'patch') patch.push(info);
      else upToDate.push(info);
    });

    // Print results
    console.log('\n' + chalk.bold('Package Update Summary:'));
    console.log(chalk.bold(`Total packages checked: ${results.length}`));

    if (major.length > 0) {
      console.log('\n' + chalk.red.bold('Major Updates Available:'));
      major.forEach((pkg) => {
        console.log(
          `${chalk.bold(pkg.name)} [${pkg.type}]: ${chalk.red(pkg.currentVersion)} → ${chalk.green(pkg.latestVersion)}`
        );
      });
    }

    if (minor.length > 0) {
      console.log('\n' + chalk.yellow.bold('Minor Updates Available:'));
      minor.forEach((pkg) => {
        console.log(
          `${chalk.bold(pkg.name)} [${pkg.type}]: ${chalk.yellow(pkg.currentVersion)} → ${chalk.green(pkg.latestVersion)}`
        );
      });
    }

    if (patch.length > 0) {
      console.log('\n' + chalk.blue.bold('Patch Updates Available:'));
      patch.forEach((pkg) => {
        console.log(
          `${chalk.bold(pkg.name)} [${pkg.type}]: ${chalk.blue(pkg.currentVersion)} → ${chalk.green(pkg.latestVersion)}`
        );
      });
    }

    if (upToDate.length > 0) {
      console.log('\n' + chalk.green.bold('Up-to-date Packages:'));
      upToDate.forEach((pkg) => {
        console.log(`${chalk.bold(pkg.name)} [${pkg.type}]: ${chalk.green(pkg.currentVersion)}`);
      });
    }
  } catch (error) {
    console.error(chalk.red('Error checking for package updates:'), error);
  }
}

/**
 * Gets the latest version of a package from npm registry
 */
async function getLatestVersion(
  packageName: string,
  currentVersion: string,
  type: 'dependencies' | 'devDependencies' | 'peerDependencies'
): Promise<PackageInfo> {
  try {
    // Clean the version string (remove ^, ~, etc.)
    const cleanCurrentVersion = currentVersion.replace(/^\^|~/, '');

    // Fetch package info from npm registry
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);
    const data = await response.json();

    // Get the latest version
    const latestVersion = data['dist-tags']?.latest;

    if (!latestVersion) {
      throw new Error(`Could not find latest version for ${packageName}`);
    }

    // Determine update type
    let updateType: 'major' | 'minor' | 'patch' | 'upToDate' = 'upToDate';

    if (semver.gt(latestVersion, cleanCurrentVersion)) {
      if (semver.major(latestVersion) > semver.major(cleanCurrentVersion)) {
        updateType = 'major';
      } else if (semver.minor(latestVersion) > semver.minor(cleanCurrentVersion)) {
        updateType = 'minor';
      } else if (semver.patch(latestVersion) > semver.patch(cleanCurrentVersion)) {
        updateType = 'patch';
      }
    }

    return {
      name: packageName,
      currentVersion: cleanCurrentVersion,
      latestVersion,
      type,
      updateType,
    };
  } catch (error) {
    console.error(`Error checking ${packageName}:`, error);
    return {
      name: packageName,
      currentVersion,
      latestVersion: 'unknown',
      type,
      updateType: 'upToDate',
    };
  }
}

// Run the script
checkForPackageUpdates()
  .then(() => console.log('\nDone checking for package updates.'))
  .catch((err) => console.error('Error:', err));
