// The local run of the GitHub pipeline (.github/workflows/ci.yml). Every pull request runs it before the push:
//   pnpm ci:local --title "<PR title>"
// Steps, stopping at the first failure: install, format, lint:files, check:utf8, affected lint/typecheck/test/build, affected
// publint (it also fails a package that is not publishable as it is) and attw, size (every entry has a budget),
// commitlint of the commits since the base, commitlint of the PR title, and the library generator proof when the
// change touches it.
// Flags: --base <ref> (default origin/main; pass --base with the branch your PR targets), --title "<PR title>" (required when the
// run is for a PR), --all (always run the generator proof). Known flakes under parallel load: workspace:test timeouts
// and machines:cycles ENOENT; re-run that target alone.
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { parseArgs } from 'node:util';

/** Paths whose change needs the library generator proof (the one owner; generator-verify.yml points here). */
const GENERATOR_PATHS = [
  /^tools\/workspace-plugin\//,
  /^tools\/scripts\/verify-library-generator\.mjs$/,
  /^tools\/eslint\//,
  /^package\.json$/,
  /^pnpm-lock\.yaml$/,
  /^pnpm-workspace\.yaml$/,
  /^compatibility\.json$/,
  /^tsconfig[^/]*\.json$/,
  /^eslint\.config\.mjs$/,
  /^nx\.json$/,
  /^\.github\/workflows\/generator-verify\.yml$/,
];

const { values } = parseArgs({
  options: { base: { type: 'string', default: 'origin/main' }, title: { type: 'string' }, all: { type: 'boolean' } },
});
const { base } = values;

/** Runs a command with an argument array (no shell string) and exits with its status on failure. */
function step(name, command, args, input) {
  console.log(`\n== ${name}`);
  const result = spawnSync(command, args, {
    stdio: [input === undefined ? 'inherit' : 'pipe', 'inherit', 'inherit'],
    input,
    shell: process.platform === 'win32' && command === 'pnpm',
  });
  if (result.status !== 0) {
    console.error(`\nci:local failed at: ${name}`);
    process.exit(result.status ?? 1);
  }
}

function changedPaths() {
  const result = spawnSync('git', ['diff', '--name-only', `${base}...HEAD`], { encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(result.stderr);
    process.exit(result.status ?? 1);
  }
  return result.stdout.split('\n').filter(Boolean);
}

step('install', 'pnpm', ['install', '--frozen-lockfile']);
step('format', 'pnpm', ['exec', 'nx', 'format:check']);
step('lint workspace files', 'pnpm', ['run', 'lint:files']);
step('UTF-8 check', 'pnpm', ['run', 'check:utf8']);
step('affected: lint typecheck test build', 'pnpm', [
  'exec',
  'nx',
  'affected',
  '-t',
  'lint',
  'typecheck',
  'test',
  'build',
  `--base=${base}`,
]);
step('affected: publint attw', 'pnpm', ['exec', 'nx', 'affected', '-t', 'publint', 'attw', `--base=${base}`]);
step('build everything for size', 'pnpm', ['exec', 'nx', 'run-many', '-t', 'build']);
step('size limit', 'pnpm', ['run', 'size']);
step('commit messages', 'pnpm', ['exec', 'commitlint', '--from', base, '--to', 'HEAD']);
if (values.title === undefined) {
  console.log('\n== PR title skipped (no --title; pass it when the run is for a PR)');
} else {
  step('PR title', 'pnpm', ['exec', 'commitlint', '--config', 'commitlint.title.config.mjs'], `${values.title}\n`);
}
if (values.all || changedPaths().some((path) => GENERATOR_PATHS.some((pattern) => pattern.test(path)))) {
  step('library generator', 'node', ['tools/scripts/verify-library-generator.mjs']);
} else {
  console.log('\n== library generator skipped (no generator path changed; --all forces it)');
}
console.log('\nci:local passed');
