import { join } from 'node:path';
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
import { posix } from '../posix-path';
import { partOfComponent } from './extract';

/** The base components a file imports from (`@cocokits/react/<component>`), by value or type. */
function importedComponentsOf(file: ts.SourceFile): Set<string> {
  const found = new Set<string>();
  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const component = baseComponentOf('react', statement.moduleSpecifier.text);
    if (component !== undefined) found.add(component);
  }
  return found;
}

/** The base component an expression re-exports (`BaseDialog.Trigger`, `Trigger`), when it comes from a base entry point. */
function reExportedComponentOf(checker: ts.TypeChecker, expression: ts.Expression): string | undefined {
  let head = expression;
  while (ts.isPropertyAccessExpression(head)) head = head.expression;
  const declaration = ts.isIdentifier(head) ? checker.getSymbolAtLocation(head)?.declarations?.[0] : undefined;
  const parent = declaration === undefined ? undefined : ts.findAncestor(declaration, ts.isImportDeclaration);
  return parent !== undefined && ts.isStringLiteral(parent.moduleSpecifier)
    ? baseComponentOf('react', parent.moduleSpecifier.text)
    : undefined;
}

/** One value export of the entry point: the name a template writes and the expression that gives it. */
interface Export {
  readonly name: string;
  readonly expression: ts.Expression;
}

/**
 * The value exports of `src/index.ts` that stand for components: a function component, and each member of a
 * namespace object (`export const Dialog = { Root: DialogRoot, Trigger: BaseDialog.Trigger }`) as `Dialog.Root`. A
 * value that is neither (`cocokitsThemeIcons`) belongs to no component and is left out.
 */
function exportsOf(checker: ts.TypeChecker, file: ts.SourceFile): Export[] {
  const module = checker.getSymbolAtLocation(file);
  if (module === undefined) return [];
  return checker
    .getExportsOfModule(module)
    .filter((exported) => /^[A-Z]/.test(exported.name))
    .flatMap((exported): Export[] => {
      const target = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      if ((target.flags & ts.SymbolFlags.Value) === 0) return [];
      const declaration = target.valueDeclaration;
      const value =
        declaration !== undefined && ts.isVariableDeclaration(declaration) ? declaration.initializer : undefined;
      if (value === undefined || !ts.isObjectLiteralExpression(value)) {
        const id =
          declaration !== undefined && (ts.isVariableDeclaration(declaration) || ts.isFunctionDeclaration(declaration))
            ? declaration.name
            : undefined;
        return id !== undefined && ts.isIdentifier(id) ? [{ name: exported.name, expression: id }] : [];
      }
      return value.properties.flatMap((property) =>
        ts.isPropertyAssignment(property) && ts.isIdentifier(property.name)
          ? [{ name: `${exported.name}.${property.name.text}`, expression: property.initializer }]
          : [],
      );
    });
}

/**
 * Reads the flat React theme package (`src/index.ts`). A component declared in the package owns the base part its
 * `@cckPart` names in the base component its file imports from (`@cocokits/react/<component>`); a part that the
 * package re-exports from a base entry point is only an export. Every member records where it is declared.
 */
export function readReactTheme(
  projectRoot: string,
  tsConfig: string,
  base: readonly BasePart[],
  problems: string[],
): ThemeRead {
  const index = posix(join(projectRoot, 'src', 'index.ts'));
  const program = createTsProgram(tsConfig, [index]);
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(index);
  if (source === undefined) throw new Error(`${index} is not part of the program`);
  const themeRoot = `${posix(projectRoot)}/`;
  const parts: ThemeRead['parts'][number][] = [];
  const exports: { component: string; name: string }[] = [];
  for (const { name, expression } of exportsOf(checker, source)) {
    const reExported = reExportedComponentOf(checker, expression);
    if (reExported !== undefined) {
      exports.push({ component: reExported, name });
      continue;
    }
    const symbol = checker.getSymbolAtLocation(expression);
    const target =
      symbol !== undefined && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    const declaration = target?.valueDeclaration;
    if (
      target === undefined ||
      declaration === undefined ||
      !posix(declaration.getSourceFile().fileName).startsWith(themeRoot)
    ) {
      problems.push(`${name}: the export has no owner, it is declared in neither the package nor a base entry point`);
      continue;
    }
    const components = importedComponentsOf(declaration.getSourceFile());
    if (components.size !== 1) {
      problems.push(
        `${name}: its file imports ${String(components.size)} base components (${[...components].join(', ')}), it needs one`,
      );
      continue;
    }
    const [component] = [...components] as [string];
    const part = withPropsOnly({ ...partOfComponent(program, checker, component, target, problems), name });
    if (!checkOwner(base, component, part.semanticId, name, problems)) continue;
    markDeclaredIn(part, projectRoot, name, problems);
    parts.push({ component, part });
    exports.push({ component, name });
  }
  problems.push(...sharedTypeProblems(program));
  return {
    parts,
    exports,
    typesOf: (component, componentParts) =>
      exportedTypesOf(
        program,
        checker,
        source,
        component,
        skipType(program, projectRoot),
        problems,
        memberTypeTexts(componentParts),
        new Set<string>(),
      ),
  };
}
