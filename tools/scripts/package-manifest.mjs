// What makes a package manifest publishable, shared by the publish checks (package-checks.mjs) and their tests.
const DEPENDENCY_FIELDS = ['dependencies', 'peerDependencies', 'optionalDependencies', 'devDependencies'];
/** Ranges the registry cannot resolve. */
const LOCAL_RANGE = /^(workspace|link|file|portal|catalog):/;
/** Fields whose value is a path inside the package. */
const PATH_FIELDS = ['main', 'module', 'types', 'typings', 'browser'];

/** Every string below `value` that starts with `./`: the file paths of an `exports` map. */
export function exportPaths(value) {
  if (typeof value === 'string') return value.startsWith('./') ? [value] : [];
  return Object.values(value ?? {}).flatMap(exportPaths);
}

const escapeRegExp = (text) => text.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The files the manifest names (`exports`, `main`, `module`, `types`, `bin`) that are not in `packed`. */
export function missingFiles(manifest, packed) {
  const bin = typeof manifest.bin === 'string' ? [manifest.bin] : Object.values(manifest.bin ?? {});
  const referenced = [...exportPaths(manifest.exports), ...PATH_FIELDS.map((field) => manifest[field]), ...bin];
  return referenced.filter((path) => {
    if (typeof path !== 'string') return false;
    const relative = path.startsWith('./') ? path.slice(2) : path;
    // A pattern such as `./components/*.css` needs at least one file that matches it.
    const pattern = new RegExp(`^${relative.split('*').map(escapeRegExp).join('.+')}$`);
    return !(relative.includes('*') ? [...packed].some((entry) => pattern.test(entry)) : packed.has(relative));
  });
}

/** The semantic version grammar of https://semver.org (npm refuses to publish any other `version`). */
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/** A missing `name`, `license` or `version`, or a `version` that is not a semantic version. */
function fieldProblems(manifest) {
  const problems = [];
  for (const field of ['name', 'license']) {
    if (typeof manifest[field] !== 'string' || manifest[field] === '') problems.push(`no "${field}" field`);
  }
  if (typeof manifest.version !== 'string' || manifest.version === '') problems.push('no "version" field');
  else if (!SEMVER.test(manifest.version)) problems.push(`"version" is "${manifest.version}", not a semantic version`);
  return problems;
}

/** What is wrong with a package that has this manifest and these files (paths relative to the package). */
export function problemsOf(manifest, packed) {
  const problems = [];
  for (const field of DEPENDENCY_FIELDS) {
    for (const [name, range] of Object.entries(manifest[field] ?? {})) {
      if (LOCAL_RANGE.test(range)) problems.push(`${field}.${name} is "${range}", not a version range`);
    }
  }
  if (manifest.publishConfig?.directory !== undefined) problems.push('publishConfig.directory is still set');
  if (manifest.private === true) problems.push('"private" is true');
  problems.push(...fieldProblems(manifest));
  for (const required of ['LICENSE', 'README.md']) {
    if (!packed.has(required)) problems.push(`${required} is missing`);
  }
  for (const path of missingFiles(manifest, packed)) problems.push(`${path} is named by package.json but is missing`);
  return problems;
}
