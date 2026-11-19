import { join } from 'node:path';
import { aliasResolverAt, aliasValuesOf, expandAliases, sharedTypeProblems } from '../api-docs-common/expand-alias';
import { exportedTypesOf, memberTypeTexts } from '../api-docs-common/exported-types';
import { type BasePart, type ThemeRead, skipType, ownersOfSelector, withPropsOnly } from '../api-docs-common/theme';
import { posix } from '../posix-path';
import { partOf, listOf, type DocDirective, type ExpandedType } from './convert';
import { classNamed, createProgram, sourceFileOf, withInstantiatedTypes, withSourceText } from './extract';
import { publicMembersOf } from './members';

/**
 * Reads the flat Angular theme package (`src/index.ts`): each exported directive owns the neutral base parts its
 * selector names, and becomes one part for each of them, with the members of the class (the base's `ApiDoc` files are
 * `base`). A member records the class file it is declared in.
 */
export function readAngularTheme(
  root: string,
  projectRoot: string,
  tsConfig: string,
  base: readonly BasePart[],
  problems: string[],
): ThemeRead {
  const file = posix(join(projectRoot, 'src', 'index.ts'));
  const program = createProgram(root, tsConfig);
  const tsProgram = program.getTsProgram();
  const checker = tsProgram.getTypeChecker();
  const themeRoot = `${posix(projectRoot).replace(/\/$/, '')}/`;
  const parts: { component: string; part: ReturnType<typeof partOf> }[] = [];
  const exports: { component: string; name: string }[] = [];
  const entries = program
    .getApiDocumentation(file, new Set())
    .entries.filter((entry) => entry.entryType === 'directive' || entry.entryType === 'component');
  for (const entry of entries) {
    const cls = classNamed(tsProgram, entry);
    if (cls === undefined) {
      problems.push(`${entry.name}: the class is not declared in ${entry.source?.filePath ?? 'a known file'}`);
      continue;
    }
    const whole = withSourceText(checker, cls, entry as unknown as DocDirective);
    const owners = ownersOfSelector(whole.selector, base, entry.name, problems);
    const resolve = aliasResolverAt(tsProgram, cls);
    const expand = (type: string): ExpandedType => ({
      text: expandAliases(type, resolve),
      values: aliasValuesOf(type, resolve),
    });
    const doc = withInstantiatedTypes(checker, cls, whole);
    const infos = publicMembersOf(checker, cls);
    owners.forEach((owner, index) => {
      // The class is read once for each owner; its problems are reported once.
      const part = withPropsOnly(partOf(owner.component, doc, infos, index === 0 ? problems : [], expand, owner.part));
      for (const info of infos.filter((item) => listOf(item.kind) === 'props')) {
        const member = part.props.find((item) => item.name === info.publicName);
        if (member !== undefined) member.declaredIn = posix(info.declaredFile).startsWith(themeRoot) ? 'theme' : 'base';
      }
      parts.push({ component: owner.component, part });
      exports.push({ component: owner.component, name: entry.name });
    });
  }
  const source = sourceFileOf(tsProgram, file);
  problems.push(...sharedTypeProblems(tsProgram));
  return {
    parts,
    exports,
    typesOf: (component, componentParts) =>
      source === undefined
        ? []
        : exportedTypesOf(
            tsProgram,
            checker,
            source,
            component,
            skipType(tsProgram, projectRoot),
            problems,
            memberTypeTexts(componentParts),
            new Set<string>(),
          ),
  };
}
