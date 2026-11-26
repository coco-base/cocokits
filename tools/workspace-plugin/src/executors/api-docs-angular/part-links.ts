import ts from 'typescript';
import type { ApiPartJson } from '../api-docs-common/types';

/** One entry of the `hostDirectives` of a directive: the class and the public names it exposes, by inner name. */
interface HostDirective {
  readonly name: string;
  readonly inputs: ReadonlyMap<string, string>;
  readonly outputs: ReadonlyMap<string, string>;
}

/** The names of a `hostDirectives` `inputs` or `outputs` list, inner name to exposed name (`'open: menuOpen'`). */
function exposedNames(list: ts.Expression | undefined): Map<string, string> {
  const names = new Map<string, string>();
  if (list === undefined || !ts.isArrayLiteralExpression(list)) return names;
  for (const item of list.elements) {
    if (!ts.isStringLiteralLike(item)) continue;
    const [inner = '', outer = inner] = item.text.split(':').map((word) => word.trim());
    names.set(inner, outer);
  }
  return names;
}

const propertyOf = (object: ts.ObjectLiteralExpression, name: string): ts.Expression | undefined =>
  object.properties.find(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) && ts.isIdentifier(property.name) && property.name.text === name,
  )?.initializer;

/** The `hostDirectives` of the `@Directive` or `@Component` decorator of a class, as written. */
function hostDirectivesOf(cls: ts.ClassDeclaration): HostDirective[] {
  const [metadata] = (ts.getDecorators(cls) ?? []).flatMap((decorator) =>
    ts.isCallExpression(decorator.expression)
      ? decorator.expression.arguments.filter(ts.isObjectLiteralExpression)
      : [],
  );
  const list = metadata === undefined ? undefined : propertyOf(metadata, 'hostDirectives');
  if (list === undefined || !ts.isArrayLiteralExpression(list)) return [];
  return list.elements.flatMap((item): HostDirective[] => {
    if (ts.isIdentifier(item)) return [{ name: item.text, inputs: new Map(), outputs: new Map() }];
    if (!ts.isObjectLiteralExpression(item)) return [];
    const directive = propertyOf(item, 'directive');
    if (directive === undefined || !ts.isIdentifier(directive)) return [];
    return [
      {
        name: directive.text,
        inputs: exposedNames(propertyOf(item, 'inputs')),
        outputs: exposedNames(propertyOf(item, 'outputs')),
      },
    ];
  });
}

/** The anatomy part of a part, from its semantic id (`menu.trigger` gives `trigger`). */
const partNameOf = (part: ApiPartJson): string => part.semanticId.slice(part.semanticId.indexOf('.') + 1);

/**
 * A problem for each member of the applied part that the host does not expose under the member's own name. A member
 * of the short form (`shortForm`) is read only when the part sits on an element of its own, so the host need not
 * expose it.
 */
function exposureProblems(host: ApiPartJson, applied: ApiPartJson, directive: HostDirective): string[] {
  const shortForm = new Set(
    [...applied.props, ...applied.events].filter((member) => member.shortForm).map((member) => member.name),
  );
  const wanted = [
    ...applied.props.map((member) => ({ name: member.name, list: 'inputs', names: directive.inputs })),
    ...(applied.bindings ?? [])
      .filter((binding) => !shortForm.has(binding.value))
      .map((binding) => ({ name: `${binding.value}Change`, list: 'outputs', names: directive.outputs })),
    ...applied.events.map((member) => ({ name: member.name, list: 'outputs', names: directive.outputs })),
  ];
  return wanted
    .filter((item) => !shortForm.has(item.name))
    .filter((item) => item.names.get(item.name) !== item.name)
    .map(
      (item) =>
        `${host.name}: the host directive ${applied.name} must expose "${item.name}" under its own name in its ${item.list}, so its members can be written on the element of ${host.name}`,
    );
}

/** A problem for a part whose `templateInput` names no part with that input. */
function templateInputProblems(part: ApiPartJson, parts: readonly ApiPartJson[]): string[] {
  if (part.templateInput === undefined) return [];
  const { partName, inputName } = part.templateInput;
  const targets = parts.filter((candidate) => partNameOf(candidate) === partName);
  return targets.some((target) => target.props.some((prop) => prop.name === inputName))
    ? []
    : [
        `${part.name}: "@cckTemplate input ${partName} ${inputName}" names no part "${partName}" with the input "${inputName}"`,
      ];
}

/** A problem for a part whose `around` names no part of the entry point. */
const aroundProblems = (part: ApiPartJson, parts: readonly ApiPartJson[]): string[] =>
  part.around === undefined || parts.some((candidate) => partNameOf(candidate) === part.around)
    ? []
    : [`${part.name}: "@cckAround ${part.around}" names no part "${part.around}" of the entry point`];

/**
 * A problem for each short-form member of a part that has no short form: the part must sit on an element of its own
 * (a selector) and also be applied by a host directive (`appliedBy`), else every member is read.
 */
const shortFormProblems = (part: ApiPartJson): string[] =>
  part.selector !== undefined && part.selector !== '' && part.appliedBy !== undefined
    ? []
    : [...part.props, ...part.events]
        .filter((member) => member.shortForm)
        .map(
          (member) =>
            `${part.name}.${member.name}: "@cckShortForm" needs a part with a selector of its own that another part also applies as a host directive`,
        );

/**
 * Writes the facts that link one part of an entry point to another, and adds a problem for each that does not hold:
 * `appliedBy` on a part whose class another part lists in its `hostDirectives` (that part must expose every input,
 * model and output of it under the same name, except the short-form members), the check of each `templateInput` (the
 * part it names exists and has that input), of each `around` (the part it names exists) and of each `shortForm` member
 * (its part has a selector and `appliedBy`). The parts are changed in place.
 *
 * @param parts - The parts of one entry point.
 * @param classOf - The class of a part, by class name.
 * @param problems - Gets one message per fact that does not hold.
 */
export function linkParts(
  parts: readonly ApiPartJson[],
  classOf: (name: string) => ts.ClassDeclaration | undefined,
  problems: string[],
): void {
  const byClass = new Map(parts.map((part) => [part.name, part]));
  for (const host of parts) {
    const cls = classOf(host.name);
    for (const directive of cls === undefined ? [] : hostDirectivesOf(cls)) {
      const applied = byClass.get(directive.name);
      if (applied === undefined) continue;
      applied.appliedBy = partNameOf(host);
      problems.push(...exposureProblems(host, applied, directive));
    }
  }
  for (const part of parts) {
    problems.push(...templateInputProblems(part, parts), ...aroundProblems(part, parts), ...shortFormProblems(part));
  }
}
