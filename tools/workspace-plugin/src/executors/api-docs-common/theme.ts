import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { posix } from '../posix-path';
import { tagsOfNode } from './jsdoc';
import { placeAt, placeOf } from './places';
import { withoutUndefined } from './member';
import type { ApiDocJson, ApiMemberJson, ApiPartJson, ApiTypeJson } from './types';

/** One part of a base `ApiDoc`: what a theme export is matched against. */
export interface BasePart {
  readonly component: string;
  readonly semanticId: string;
  /** The anatomy part, the semantic id without the component (`root`, `content`). */
  readonly part: string;
  /** Angular only. */
  readonly selector: string | undefined;
  /** Angular only: the anatomy part whose directive applies this part as a host directive. */
  readonly appliedBy?: string | undefined;
}

/** The parts of every base `ApiDoc` (`<baseDir>/<component>.json`). */
export function readBaseParts(baseDir: string): BasePart[] {
  const files = readdirSync(baseDir).filter((file) => file.endsWith('.json'));
  if (files.length === 0) throw new Error(`${baseDir} has no base ApiDoc; run the api-docs target of the base package`);
  return files.flatMap((file) => {
    const doc = JSON.parse(readFileSync(join(baseDir, file), 'utf8')) as ApiDocJson;
    return doc.parts.map((part) => ({
      component: doc.component,
      semanticId: part.semanticId,
      part: part.semanticId.slice(doc.component.length + 1),
      selector: part.selector,
      appliedBy: part.appliedBy,
    }));
  });
}

/** A selector without its element name: `dialog[cckDialogContent]` is `[cckDialogContent]`. */
const withoutElement = (selector: string): string => selector.replace(/^[a-z][\w-]*(?=\[)/, '');

/** Whether a selector alternative of a theme directive names a base part: the same selector, or with an element name. */
const names = (alternative: string, baseSelector: string): boolean =>
  alternative === baseSelector || (baseSelector.startsWith('[') && withoutElement(alternative) === baseSelector);

/**
 * The base part that owns an alternative naming `part`: the root of its component when `part` applies that root as a
 * host directive (the members of the root sit on the element of `part`), else `part` itself.
 */
const ownerOf = (part: BasePart, base: readonly BasePart[]): BasePart =>
  base.find(
    (candidate) =>
      candidate.component === part.component && candidate.part === 'root' && candidate.appliedBy === part.part,
  ) ?? part;

/**
 * The neutral base parts a theme directive owns, by its selector list (Decision 2): each alternative names one base
 * part, and alternatives that name the classes of one neutral part (`button[cckButton]`, `a[cckButton]`) count once.
 * An alternative that names a part which applies the root through `hostDirectives` (`button[cckDialogTriggerFor]`) is
 * owned by the root. An alternative that names no base part, or parts of two base components, adds a problem.
 */
export function ownersOfSelector(
  selector: string,
  base: readonly BasePart[],
  label: string,
  problems: string[],
): BasePart[] {
  const owners = new Map<string, BasePart>();
  for (const alternative of selector.split(',').map((item) => item.trim())) {
    const found = base.filter((part) => part.selector !== undefined && names(alternative, part.selector));
    if (found.length === 0) problems.push(`${label}: the selector "${alternative}" names no base part`);
    for (const part of found.map((item) => ownerOf(item, base))) owners.set(part.semanticId, part);
  }
  const components = new Set([...owners.values()].map((part) => part.component));
  if (components.size > 1) {
    problems.push(
      `${label}: the selector "${selector}" names parts of two base components (${[...components].join(', ')})`,
    );
    return [];
  }
  return [...owners.values()];
}

/** The component a module specifier of the base package of a framework stands for: `@cocokits/react/dialog`. */
export function baseComponentOf(framework: 'react' | 'vue', specifier: string): string | undefined {
  const match = new RegExp(`^@cocokits/${framework}/([a-z][a-z0-9-]*)$`).exec(specifier);
  return match?.[1];
}

/** What a framework reader found in a flat theme package. */
export interface ThemeRead {
  /** One entry per theme part and owner base part. */
  readonly parts: readonly { readonly component: string; readonly part: ApiPartJson }[];
  /** The value exports that belong to a component, as a template writes them. */
  readonly exports: readonly { readonly component: string; readonly name: string }[];
  /** The Types rows of a component: the types of the theme package that its members name. */
  readonly typesOf: (component: string, parts: readonly ApiPartJson[]) => ApiTypeJson[];
}

/** Adds a problem for a theme part that no base part of its component stands behind. */
export function checkOwner(
  base: readonly BasePart[],
  component: string,
  semanticId: string,
  label: string,
  problems: string[],
): boolean {
  const found = base.some((part) => part.component === component && part.semanticId === semanticId);
  if (!found) problems.push(`${label}: no base part "${semanticId}" in the component "${component}"`);
  return found;
}

/**
 * The part with its props only. A theme option is a prop; the events, slots and methods of a themed part forward the
 * base part's, and the base `ApiDoc` documents them.
 */
export function withPropsOnly(part: ApiPartJson): ApiPartJson {
  const result: ApiPartJson = { ...part, props: part.props.map(typeAsWritten), events: [], slots: [], methods: [] };
  delete result.bindings;
  return result;
}

/**
 * The member with one spelling of its type text, whatever the framework reader wrote: string literals in single quotes
 * (Angular and Vue read them from the compiler with double quotes) and no closing `| undefined` (Angular keeps it).
 */
function typeAsWritten(member: ApiMemberJson): ApiMemberJson {
  const type = withoutUndefined(member.type.replace(/"([^"'\\]*)"/g, "'$1'"), member.required);
  return placeAt({ ...member, type }, placeOf(member));
}

/** Sets `declaredIn` on every prop of a part: where its declaration was noted, in the theme package or not. */
export function markDeclaredIn(part: ApiPartJson, projectRoot: string, label: string, problems: string[]): void {
  const root = `${posix(projectRoot).replace(/\/$/, '')}/`;
  for (const member of part.props) {
    const file = placeOf(member)?.getSourceFile().fileName;
    if (file === undefined) problems.push(`${label}.${member.name}: the declaration of the member is not known`);
    else member.declaredIn = posix(file).startsWith(root) ? 'theme' : 'base';
  }
}

/** The `ApiDoc` of every component the theme package has a part for, with its `theme` and `exports`. */
export function themeDocsOf(read: ThemeRead, theme: string, framework: 'angular' | 'react' | 'vue'): ApiDocJson[] {
  const components = [...new Set(read.parts.map((item) => item.component))].sort();
  return components.map((component): ApiDocJson => {
    const parts = read.parts
      .filter((item) => item.component === component)
      .map((item) => item.part)
      .sort((a, b) => a.name.localeCompare(b.name) || a.semanticId.localeCompare(b.semanticId));
    const exports = [...new Set(read.exports.filter((item) => item.component === component).map((item) => item.name))];
    const types = read.typesOf(component, parts);
    return {
      component,
      framework,
      theme,
      exports: exports.sort(),
      parts,
      ...(types.length > 0 ? { types } : {}),
    };
  });
}

/**
 * Whether a type name needs no Types row of a theme doc: it is no interface or alias of the theme package (a base type
 * a member names, which the base `ApiDoc` lists), or it is the props type of a part (`@cckPart`).
 */
export function skipType(program: ts.Program, projectRoot: string): (name: string) => boolean {
  const root = `${posix(projectRoot)}/`;
  const own = new Map<string, ts.Declaration>();
  for (const file of program.getSourceFiles().filter((item) => posix(item.fileName).startsWith(root))) {
    for (const statement of file.statements) {
      if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) {
        own.set(statement.name.text, statement);
      }
    }
  }
  return (name) => {
    const declaration = own.get(name);
    return declaration === undefined || tagsOfNode(declaration).some((tag) => tag.name === 'cckPart');
  };
}
