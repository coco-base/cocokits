import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import ts from 'typescript';
import { createTsProgram, sharedTypeProblems } from '../api-docs-common/expand-alias';
import { exportedTypesOf, memberTypeTexts } from '../api-docs-common/exported-types';
import {
  type BasePart,
  type ThemeRead,
  baseComponentOf,
  checkOwner,
  skipType,
  markDeclaredIn,
  withPropsOnly,
} from '../api-docs-common/theme';
import { loadPackage } from '../load-module';
import { posix } from '../posix-path';
import { declarationReader } from './declaration-reader';
import { type MetaModule, partOf, typesFilesOf } from './extract';

const SCRIPT = new RegExp('<script[^>]*>([^]*?)</script>', 'g');

/** The base components the script of a `.vue` file imports from (`@cocokits/vue/<component>`). */
function importedComponentsOf(file: string): Set<string> {
  const text = readFileSync(file, 'utf8');
  const script = [...text.matchAll(SCRIPT)].map((match) => match[1] ?? '').join('\n');
  const source = ts.createSourceFile('script.ts', script, ts.ScriptTarget.Latest);
  const found = new Set<string>();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const component = baseComponentOf('vue', statement.moduleSpecifier.text);
    if (component !== undefined) found.add(component);
  }
  return found;
}

/**
 * Reads the flat Vue theme package (`src/*.vue`, `src/*.types.ts`, `src/index.ts`). A `.vue` file owns the base part
 * its `<Name>Props` `@cckPart` names in the base component the file imports from (`@cocokits/vue/<component>`); a part
 * that the package re-exports from a base entry point is only an export. Every member records where it is declared.
 */
export function readVueTheme(
  root: string,
  projectRoot: string,
  tsConfig: string,
  base: readonly BasePart[],
  problems: string[],
): ThemeRead {
  const dir = posix(join(projectRoot, 'src'));
  const index = `${dir}/index.ts`;
  const { createChecker } = loadPackage(root, 'vue-component-meta') as MetaModule;
  const metaChecker = createChecker(posix(tsConfig), { forceUseTs: true, schema: { ignore: [] } });
  try {
    const typeFiles = typesFilesOf(dir);
    const program = createTsProgram(tsConfig, [...typeFiles, index]);
    const checker = program.getTypeChecker();
    const sources = typeFiles.flatMap((file) => program.getSourceFile(file) ?? []);
    const scope = sources.length === 0 ? undefined : { program, checker, sources };
    const readDeclaration = declarationReader(root);
    const parts: ThemeRead['parts'][number][] = [];
    const ownerOf = new Map<string, string>();
    for (const file of readdirSync(dir)
      .filter((item) => item.endsWith('.vue'))
      .sort()) {
      const name = basename(file, '.vue');
      const components = importedComponentsOf(join(dir, file));
      if (components.size !== 1) {
        problems.push(
          `${name}: its file imports ${String(components.size)} base components (${[...components].join(', ')}), it needs one`,
        );
        continue;
      }
      const [component] = [...components] as [string];
      // Only the props are read: a theme option is a prop, and the events, slots and methods forward the base's.
      const meta = { ...metaChecker.getComponentMeta(`${dir}/${file}`), events: [], slots: [], exposed: [] };
      const part = withPropsOnly(partOf(readDeclaration, component, name, dir, meta, problems, scope));
      if (!checkOwner(base, component, part.semanticId, name, problems)) continue;
      markDeclaredIn(part, projectRoot, name, problems);
      ownerOf.set(name, component);
      parts.push({ component, part });
    }
    const exports = exportsOf(program, index, ownerOf, problems);
    problems.push(...sharedTypeProblems(program));
    const entry = program.getSourceFile(index);
    return {
      parts,
      exports,
      typesOf: (component, componentParts) =>
        entry === undefined
          ? []
          : exportedTypesOf(
              program,
              checker,
              entry,
              component,
              skipType(program, projectRoot),
              problems,
              memberTypeTexts(componentParts),
              new Set<string>(),
            ),
    };
  } finally {
    metaChecker.dispose?.();
  }
}

/**
 * The value exports of `src/index.ts` that belong to a component: a `.vue` file of the package (its component is the
 * one the file imports from) and a name re-exported from a base entry point. Other exports (`cocokitsThemeIcons`) and
 * all type exports belong to no component.
 */
function exportsOf(
  program: ts.Program,
  index: string,
  ownerOf: ReadonlyMap<string, string>,
  problems: string[],
): { component: string; name: string }[] {
  const found: { component: string; name: string }[] = [];
  for (const { specifier, names } of valueExportsOf(program.getSourceFile(index))) {
    const own = specifier.endsWith('.vue') ? ownerOf.get(basename(specifier, '.vue')) : undefined;
    const component = own ?? baseComponentOf('vue', specifier);
    for (const name of names) {
      if (component !== undefined) found.push({ component, name });
      else if (specifier.startsWith('./')) problems.push(`${name}: the export has no owner (${specifier})`);
    }
  }
  return found;
}

/** The `export { a, b } from '<specifier>'` statements of a file, without the type exports. */
function valueExportsOf(source: ts.SourceFile | undefined): { specifier: string; names: string[] }[] {
  const found: { specifier: string; names: string[] }[] = [];
  for (const statement of source?.statements ?? []) {
    const clause = ts.isExportDeclaration(statement) && !statement.isTypeOnly ? statement.exportClause : undefined;
    const from = ts.isExportDeclaration(statement) ? statement.moduleSpecifier : undefined;
    if (clause === undefined || !ts.isNamedExports(clause) || from === undefined || !ts.isStringLiteral(from)) continue;
    found.push({
      specifier: from.text,
      names: clause.elements.filter((item) => !item.isTypeOnly).map((item) => item.name.text),
    });
  }
  return found;
}
