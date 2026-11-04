import ts from 'typescript';

/** What a public member of a directive is for a template. */
export type MemberKind = 'input' | 'model' | 'output' | 'method' | 'property';

/** A public member of a directive class, found in the class itself or in a class it extends. */
export interface MemberInfo {
  /** The property or method name in the source. */
  readonly name: string;
  /** The name a template uses: the alias of an input or output, else `name`. */
  readonly publicName: string;
  readonly kind: MemberKind;
  /** Whether the template must set it (`input.required`, `model.required`, `@Input({ required: true })`). */
  readonly required: boolean;
  /** The class that declares the member the reader sees (the most derived declaration). */
  readonly declaredIn: string;
}

interface Declaration {
  readonly kind: MemberKind;
  readonly alias: string | undefined;
  readonly required: boolean;
}

type Member = ts.ClassElement;

const LIFECYCLE = /^ng[A-Z]/;
const SIGNAL_TYPES: Readonly<Record<string, MemberKind>> = {
  InputSignal: 'input',
  InputSignalWithTransform: 'input',
  ModelSignal: 'model',
  OutputEmitterRef: 'output',
  OutputRef: 'output',
  EventEmitter: 'output',
};

function stringOf(node: ts.Expression | undefined): string | undefined {
  return node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : undefined;
}

/** The `alias` and `required` of an options object literal such as `{ alias: 'x', required: true }`. */
function optionsOf(node: ts.Expression | undefined): { alias: string | undefined; required: boolean } {
  let alias: string | undefined;
  let required = false;
  if (node && ts.isObjectLiteralExpression(node)) {
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property) || !ts.isIdentifier(property.name)) continue;
      if (property.name.text === 'alias') alias = stringOf(property.initializer);
      if (property.name.text === 'required') required = property.initializer.kind === ts.SyntaxKind.TrueKeyword;
    }
  }
  return { alias, required };
}

/** The callee of `input(...)`, `input.required(...)`, `model(...)`, `model.required(...)` or `output(...)`. */
function initializerApi(call: ts.CallExpression): { name: string; required: boolean } | undefined {
  const callee = call.expression;
  if (ts.isIdentifier(callee)) return { name: callee.text, required: false };
  if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) && callee.name.text === 'required') {
    return { name: callee.expression.text, required: true };
  }
  return undefined;
}

/** `input(...)`, `model(...)` and `output(...)` initializers. */
function fromInitializer(member: ts.PropertyDeclaration): Declaration | undefined {
  const call = member.initializer;
  if (!call || !ts.isCallExpression(call)) return undefined;
  const api = initializerApi(call);
  if (api?.name !== 'input' && api?.name !== 'model' && api?.name !== 'output') return undefined;
  const optionsIndex = api.required || api.name === 'output' ? 0 : 1;
  const options = optionsOf(call.arguments[optionsIndex]);
  const kind: MemberKind = api.name;
  return { kind, alias: options.alias, required: api.required };
}

/** `@Input()` and `@Output()`, with an alias string or an options object. */
function fromDecorator(member: Member): Declaration | undefined {
  for (const decorator of ts.canHaveDecorators(member) ? (ts.getDecorators(member) ?? []) : []) {
    const call = decorator.expression;
    if (!ts.isCallExpression(call) || !ts.isIdentifier(call.expression)) continue;
    const name = call.expression.text;
    if (name !== 'Input' && name !== 'Output') continue;
    const first = call.arguments[0];
    const options = optionsOf(first);
    return {
      kind: name === 'Input' ? 'input' : 'output',
      alias: stringOf(first) ?? options.alias,
      required: options.required,
    };
  }
  return undefined;
}

/** A property of a `.d.ts` class has no initializer, so its declared type says what it is. */
function fromDeclaredType(member: ts.PropertyDeclaration): Declaration | undefined {
  const type = member.type;
  if (!type || !ts.isTypeReferenceNode(type) || !ts.isIdentifier(type.typeName)) return undefined;
  const kind = SIGNAL_TYPES[type.typeName.text];
  return kind ? { kind, alias: undefined, required: false } : undefined;
}

function declarationOf(member: Member): Declaration {
  const decorated = fromDecorator(member);
  if (decorated) return decorated;
  if (ts.isPropertyDeclaration(member)) {
    const declared = fromInitializer(member) ?? fromDeclaredType(member);
    if (declared) return declared;
  }
  const isMethod = ts.isMethodDeclaration(member);
  return { kind: isMethod ? 'method' : 'property', alias: undefined, required: false };
}

function nameOf(member: Member): string | undefined {
  const name = member.name;
  if (!name) return undefined;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return undefined;
}

function isMemberDeclaration(member: Member): boolean {
  return (
    ts.isPropertyDeclaration(member) ||
    ts.isMethodDeclaration(member) ||
    ts.isGetAccessorDeclaration(member) ||
    ts.isSetAccessorDeclaration(member)
  );
}

/** The class a class extends, followed through an import; undefined for a class without a base. */
export function baseClassOf(checker: ts.TypeChecker, cls: ts.ClassDeclaration): ts.ClassDeclaration | undefined {
  const heritage = cls.heritageClauses?.find((clause) => clause.token === ts.SyntaxKind.ExtendsKeyword);
  const expression = heritage?.types[0]?.expression;
  if (!expression) return undefined;
  let symbol = checker.getSymbolAtLocation(expression);
  if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
  return symbol?.declarations?.find(ts.isClassDeclaration);
}

/** The class and every class it extends, base class last, through any base class, exported or not. */
function chainOf(checker: ts.TypeChecker, cls: ts.ClassDeclaration): ts.ClassDeclaration[] {
  const chain: ts.ClassDeclaration[] = [];
  const seen = new Set<ts.ClassDeclaration>();
  for (let current: ts.ClassDeclaration | undefined = cls; current && !seen.has(current);) {
    chain.push(current);
    seen.add(current);
    current = baseClassOf(checker, current);
  }
  return chain;
}

function modifiersOf(member: Member): { hidden: boolean; abstract: boolean } {
  const flags = ts.getCombinedModifierFlags(member);
  const internal = ts.getJSDocTags(member).some((tag) => tag.tagName.text === 'internal');
  const hidden =
    internal || (flags & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected | ts.ModifierFlags.Static)) !== 0;
  return { hidden, abstract: (flags & ts.ModifierFlags.Abstract) !== 0 };
}

/**
 * The public members of a directive class and of every class it extends. A class further down the chain wins (a
 * subclass that redeclares a member replaces the base's), and a member keeps the position of its first declaration,
 * so the order is the order of the base class first. Protected, private, static, abstract and `@internal` members, lifecycle
 * hooks and the members Angular adds (`ɵ`) are never listed: a member that a subclass makes public by implementing an
 * abstract one is listed.
 */
export function publicMembersOf(checker: ts.TypeChecker, cls: ts.ClassDeclaration): MemberInfo[] {
  const found = new Map<string, MemberInfo | undefined>();
  for (const current of chainOf(checker, cls).reverse()) {
    const declaredIn = current.name?.text ?? 'anonymous class';
    for (const member of current.members.filter(isMemberDeclaration)) {
      const name = nameOf(member);
      if (name === undefined || LIFECYCLE.test(name) || name.startsWith('ɵ')) continue;
      const { hidden, abstract } = modifiersOf(member);
      if (hidden || abstract) {
        found.set(name, undefined);
        continue;
      }
      const declaration = declarationOf(member);
      const previous = found.get(name);
      // A getter/setter pair is one member: a decorator on either side counts.
      if (previous?.declaredIn === declaredIn && previous.kind !== 'property' && declaration.kind === 'property') {
        continue;
      }
      found.set(name, {
        name,
        publicName: declaration.alias ?? name,
        kind: declaration.kind,
        required: declaration.required,
        declaredIn,
      });
    }
  }
  return [...found.values()].filter((info): info is MemberInfo => info !== undefined);
}
