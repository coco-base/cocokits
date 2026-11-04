import ts from 'typescript';

/** The text of each type parameter that has a default, by name: `<T = string>` gives `T` the text `string`. */
export function typeParameterDefaults(
  parameters: readonly ts.TypeParameterDeclaration[] | undefined,
): Map<string, string> {
  const found = new Map<string, string>();
  for (const parameter of parameters ?? []) {
    if (parameter.default !== undefined) found.set(parameter.name.text, parameter.default.getText());
  }
  return found;
}

/**
 * The type text with every type parameter replaced by its default (`T[]` gives `string[]`), so a generic component
 * is read as the component with the default type: a reader of the JSON treats the Select as string-valued
 * (api-extraction.md, generic components). A name that is not a type parameter with a default stays. A type that is
 * a bare type parameter with a default of `true` or `false` (the `M` of a Select `multiple?: M`) is the boolean the
 * author writes, so it reads `boolean`: the default only narrows the other members.
 */
export function withDefaultArguments(type: string, defaults: ReadonlyMap<string, string>): string {
  let result = type;
  for (const [name, text] of defaults) {
    const flag = (text === 'true' || text === 'false') && new RegExp(`^${name}(\\s*\\|\\s*undefined)?$`).test(result);
    result = flag ? 'boolean' : result.replace(new RegExp(`\\b${name}\\b`, 'g'), text);
  }
  return result;
}

/** The defaults of the type parameters of the declaration around a node (an interface, a type alias or a class). */
export function enclosingDefaults(node: ts.Node | undefined): Map<string, string> {
  for (let current = node; current !== undefined; current = current.parent) {
    if (ts.isInterfaceDeclaration(current) || ts.isTypeAliasDeclaration(current) || ts.isClassDeclaration(current)) {
      return typeParameterDefaults(current.typeParameters);
    }
  }
  return new Map();
}
