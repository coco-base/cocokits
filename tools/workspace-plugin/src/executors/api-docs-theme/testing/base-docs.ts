/** One part of a fixture base `ApiDoc`: its semantic id (`dialog.root`) and, for Angular, its selector. */
export interface FixturePart {
  readonly id: string;
  readonly selector?: string;
}

/**
 * The files of a fixture base `ApiDoc` folder (`../base/<component>.json`, next to the `pkg` folder of a scratch
 * package), one file per component.
 */
export function baseDocFiles(parts: readonly FixturePart[]): Record<string, string> {
  const byComponent = new Map<string, FixturePart[]>();
  for (const part of parts) {
    const component = part.id.slice(0, part.id.indexOf('.'));
    byComponent.set(component, [...(byComponent.get(component) ?? []), part]);
  }
  return Object.fromEntries(
    [...byComponent].map(([component, list]) => [
      `../base/${component}.json`,
      JSON.stringify({
        component,
        framework: 'angular',
        parts: list.map((part) => ({
          name: part.id,
          semanticId: part.id,
          ...(part.selector === undefined ? {} : { selector: part.selector }),
          description: 'x',
          props: [],
          events: [],
          slots: [],
          methods: [],
        })),
      }),
    ]),
  );
}
