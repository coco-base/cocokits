import ts from 'typescript';
import { moduleEntryPointsOf } from '../api-docs-common/entries';
import { exportedTypesOf, exportsOf, type TypeText } from '../api-docs-common/exported-types';
import { createTsProgram, isOwn, sharedTypeProblems } from '../api-docs-common/expand-alias';
import { docOfNode, oneLine, tagLikeLineProblems, type TsDocText } from '../api-docs-common/jsdoc';
import { placeAt } from '../api-docs-common/places';
import { problemsError } from '../api-docs-common/run';
import { isInternal, paragraphsOf, partDocFields, tagsOf, withoutLinks } from '../api-docs-common/tags';
import type { ApiDocJson, ApiParamJson, ApiSymbolJson } from '../api-docs-common/types';

/** A function the entry point exports: a `function` declaration, or a `const` with an arrow or function expression. */
type FunctionLike = ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression;

function functionOf(declaration: ts.Declaration): FunctionLike | undefined {
  if (ts.isFunctionDeclaration(declaration)) return declaration;
  if (!ts.isVariableDeclaration(declaration)) return undefined;
  const { initializer } = declaration;
  return initializer !== undefined && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
    ? initializer
    : undefined;
}

/** A tag text with links as plain text, on one line. */
const plain = (text: string): string => withoutLinks(text).replace(/\s+/g, ' ').trim();

/** The `@param` texts by parameter name; the text of a tag starts with the name and may continue after a dash. */
function paramTextsOf(doc: TsDocText): Map<string, string> {
  const texts = new Map<string, string>();
  for (const text of tagsOf(doc.tags, 'param')) {
    const match = /^(\S+)\s+(?:-\s+)?(\S[\s\S]*)$/.exec(text);
    if (match !== null) texts.set(match[1] ?? '', plain(match[2] ?? ''));
  }
  return texts;
}

/** The `function` symbol of a declaration, with every parameter read from the source and its `@param` text. */
function functionSymbolOf(
  checker: ts.TypeChecker,
  label: string,
  declaration: ts.Declaration,
  fn: FunctionLike,
  base: Pick<ApiSymbolJson, 'name' | 'description' | 'remarks' | 'examples'>,
  doc: TsDocText,
  problems: string[],
): ApiSymbolJson {
  const texts = paramTextsOf(doc);
  const params = fn.parameters.map((parameter): ApiParamJson => {
    if (!ts.isIdentifier(parameter.name)) problems.push(`${label}: a parameter is destructured; give it a name`);
    const name = ts.isIdentifier(parameter.name) ? parameter.name.text : 'options';
    return {
      name,
      type: oneLine(parameter.type?.getText() ?? checker.typeToString(checker.getTypeAtLocation(parameter))),
      optional:
        parameter.questionToken !== undefined ||
        parameter.initializer !== undefined ||
        parameter.dotDotDotToken !== undefined,
      description: texts.get(name) ?? '',
    };
  });
  for (const known of texts.keys()) {
    if (!params.some((param) => param.name === known))
      problems.push(`${label}: "@param ${known}" names no parameter of the function`);
  }
  const signature = checker.getSignatureFromDeclaration(fn);
  const returnType =
    fn.type?.getText() ??
    (signature === undefined ? 'void' : checker.typeToString(checker.getReturnTypeOfSignature(signature)));
  const [returns = ''] = tagsOf(doc.tags, 'returns');
  const throws = tagsOf(doc.tags, 'throws').map(plain);
  return placeAt(
    {
      kind: 'function',
      ...base,
      params,
      returns: { type: oneLine(returnType), description: plain(returns) },
      ...(throws.length > 0 ? { throws } : {}),
      props: [],
      methods: [],
    },
    declaration,
  );
}

/** The type of a constant: its written type, else the checker's. */
const constantTypeOf = (checker: ts.TypeChecker, declaration: ts.VariableDeclaration): string =>
  oneLine(
    declaration.type?.getText() ??
      checker.typeToString(checker.getTypeAtLocation(declaration), declaration, ts.TypeFormatFlags.NoTruncation),
  );

/** The symbol of one export, with the type texts it names, or undefined for a type, an `@internal` export or a problem. */
function symbolOf(
  program: ts.Program,
  checker: ts.TypeChecker,
  module: string,
  exported: ts.Symbol,
  problems: string[],
): { item: ApiSymbolJson; texts: TypeText[] } | undefined {
  const target = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
  if ((target.flags & ts.SymbolFlags.Value) === 0) return undefined;
  const declaration = target.declarations?.find(
    (item) => ts.isFunctionDeclaration(item) || ts.isVariableDeclaration(item),
  );
  if (declaration === undefined || !isOwn(program, declaration)) {
    problems.push(`${module}: the export "${exported.name}" is no function or constant`);
    return undefined;
  }
  const doc = docOfNode(declaration);
  const [description] = paragraphsOf(doc.description);
  if (isInternal(doc.tags)) return undefined;
  if (description === undefined) {
    problems.push(`${module}: ${exported.name} has no TSDoc description`);
    return undefined;
  }
  problems.push(...tagLikeLineProblems(`${module} ${exported.name}`, doc));
  const base = { name: exported.name, description, ...partDocFields(doc.description, doc.tags) };
  const fn = functionOf(declaration);
  if (fn !== undefined) {
    const item = functionSymbolOf(checker, `${module} ${exported.name}`, declaration, fn, base, doc, problems);
    const types = [...(item.params ?? []).map((param) => param.type), item.returns?.type ?? ''];
    return { item, texts: types.map((text) => ({ text, at: declaration })) };
  }
  if (!ts.isVariableDeclaration(declaration)) return undefined;
  const type = constantTypeOf(checker, declaration);
  return {
    item: placeAt({ kind: 'constant', ...base, type, props: [], methods: [] }, declaration),
    texts: [{ text: type, at: declaration }],
  };
}

/**
 * The `ApiDoc` of every module of a framework-free package: a folder `src/<module>/index.ts` (all its exports), or a
 * file that `src/index.ts` re-exports from (the names that line exports). An exported function is a `function`
 * symbol, an exported `const` a `constant` symbol, an interface or alias a Types row. An `@internal` export is left
 * out; an export with no TSDoc description is a problem. Throws one error that lists every problem and writes nothing.
 *
 * @param projectRoot - The absolute folder of the package.
 * @param tsConfig - The absolute path of the package tsconfig.
 */
export function extractTsApiDocs(_root: string, projectRoot: string, tsConfig: string): ApiDocJson[] {
  const entries = moduleEntryPointsOf(projectRoot);
  if (entries.length === 0) throw new Error(`${projectRoot} has no module entry point (src/<name>/index.ts)`);
  const program = createTsProgram(
    tsConfig,
    entries.map((entry) => entry.file),
  );
  const checker = program.getTypeChecker();
  const problems: string[] = [];
  const docs = entries.map(({ name, file, only }): ApiDocJson => {
    const source = program.getSourceFile(file);
    const moduleSymbol = source === undefined ? undefined : checker.getSymbolAtLocation(source);
    if (source === undefined || moduleSymbol === undefined) {
      problems.push(`${name}: ${file} is not a module`);
      return { component: name, framework: 'ts', parts: [] };
    }
    const symbols: ApiSymbolJson[] = [];
    const used: TypeText[] = [];
    for (const exported of exportsOf(checker, moduleSymbol, only)) {
      const symbol = symbolOf(program, checker, name, exported, problems);
      if (symbol === undefined) continue;
      const { item, texts } = symbol;
      used.push(...texts);
      symbols.push(item);
    }
    const types = exportedTypesOf(program, checker, source, name, () => false, problems, used, only);
    return {
      component: name,
      framework: 'ts',
      parts: [],
      ...(symbols.length > 0 ? { symbols } : {}),
      ...(types.length > 0 ? { types } : {}),
    };
  });
  problems.push(...sharedTypeProblems(program));
  if (problems.length > 0) throw problemsError(problems);
  return docs;
}
