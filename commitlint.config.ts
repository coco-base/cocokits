import { spawnSync } from 'child_process';
import { RuleConfigCondition } from '@commitlint/types';
import type { Commit } from 'conventional-commits-parser';

enum CommitType {
  Feat = 'feat', // A new feature
  Fix = 'fix', // A bug fix
  Docs = 'docs', // Documentation only changes
  Perf = 'perf', // A code change that improves performance
  Refactor = 'refactor', // A code change that neither fixes a bug nor adds a feature
  Test = 'test', // Adding missing tests or correcting existing tests
  Chore = 'chore', // Changes to the build process or auxiliary tools and libraries. (documentation generation, build, pipelines, directories, scripts, tools, updates such as package.json)
  Release = 'release', // versioning, build
}

const COMMIT_TYPE_SCOPE: Record<CommitType, boolean> = {
  [CommitType.Feat]: true,
  [CommitType.Fix]: true,
  [CommitType.Docs]: true,
  [CommitType.Perf]: true,
  [CommitType.Refactor]: true,
  [CommitType.Test]: true,
  [CommitType.Chore]: false,
  [CommitType.Release]: false,
};

const packagesJson = spawnSync('pnpm', ['nx', 'show', 'projects', '--json'], { encoding: 'utf8' }).stdout;
const packagesList = (JSON.parse(packagesJson) as string[]).map((name) => name.replace('@coco-kits/', ''));

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', Object.values(CommitType)],
    'header-max-length': [0, 'always', 72],
    'cck-scope': [2, 'always', packagesList],
  },
  plugins: [
    {
      rules: {
        'cck-scope': (parsed: Commit, when: RuleConfigCondition, packagesList: string[]) => {
          const type = parsed.type as CommitType;
          const canHaveScope = COMMIT_TYPE_SCOPE[type];

          if (!canHaveScope) {
            return parsed.scope ? [false, `Commit type '${type}' can not have any scope`] : [true];
          }

          const isScopeValid = packagesList.includes(parsed.scope);
          if (!isScopeValid) {
            return [
              false,
              `Commit scope '${parsed.scope}' is not a valid scope. Here is all valid scopes: \n${packagesList.join(
                '\n'
              )}\n`,
            ];
          }

          return [true];
        },
      },
    },
  ],
};
