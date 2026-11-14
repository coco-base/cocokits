import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadBuiltModule } from '../load-module';
import type { JsonFile } from '../write-json';

type Fields = Record<string, unknown>;

const isRecord = (value: unknown): value is Fields =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isText = (value: unknown): value is string => typeof value === 'string' && value !== '';

/** An attribute name without `data-`; the protocol accepts nothing else. */
const ATTR_NAME = /^[a-z0-9-]+$/;
/** The fields of a `ThemeOption`. Anything else is not a theme option field. */
const OPTION_FIELDS = ['attrName', 'values', 'default', 'partNames', 'description'];

function checkOption(where: string, option: unknown): void {
  if (!isRecord(option)) throw new Error(`${where}: not an object`);
  const unknown = Object.keys(option).filter((key) => !OPTION_FIELDS.includes(key));
  if (unknown.length > 0) throw new Error(`${where}: unknown theme option field "${unknown.join('", "')}"`);
  const { attrName, values, default: fallback, partNames, description } = option;
  if (typeof attrName !== 'string' || !ATTR_NAME.test(attrName)) {
    throw new Error(`${where}: attrName must be an attribute name without "data-", got ${JSON.stringify(attrName)}`);
  }
  if (
    !Array.isArray(values) ||
    values.length === 0 ||
    !values.every((v) => typeof v === 'string' || typeof v === 'boolean')
  ) {
    throw new Error(`${where}: values must be a non-empty list of strings or booleans`);
  }
  if (fallback !== null && !(values as unknown[]).includes(fallback)) {
    throw new Error(`${where}: default ${JSON.stringify(fallback)} is not one of the values`);
  }
  if (partNames !== undefined && !(Array.isArray(partNames) && partNames.every((name) => isText(name)))) {
    throw new Error(`${where}: partNames must be a list of part names`);
  }
  if (description !== undefined && typeof description !== 'string')
    throw new Error(`${where}: description must be text`);
}

/** The part icons of a component (`components.<name>.icons`): a record of part name to non-empty icon name. */
function checkPartIcons(where: string, icons: unknown): void {
  if (!isRecord(icons)) throw new Error(`${where}: icons must be an object of part names to icon names`);
  for (const [part, name] of Object.entries(icons)) {
    if (!isText(name)) throw new Error(`${where}.icons.${part}: the icon name must be non-empty text`);
  }
}

/** Whether `value` has the shape of a `ThemeConfig`: a `name` and an object of `components`. */
const looksLikeThemeConfig = (value: unknown): value is { name: string; components: Fields } =>
  isRecord(value) && isText(value['name']) && isRecord(value['components']);

/** The one export of the theme's entry module that is a `ThemeConfig`, checked option by option. */
export function themeConfigOf(exported: Fields, entry: string): { name: string; components: Fields } {
  const configs = Object.entries(exported).filter(([, value]) => looksLikeThemeConfig(value));
  const [first, ...more] = configs;
  if (first === undefined) throw new Error(`${entry} exports no ThemeConfig (an object with a name and components)`);
  if (more.length > 0) {
    throw new Error(`${entry} exports more than one ThemeConfig: ${configs.map(([name]) => name).join(', ')}`);
  }
  const config = first[1] as { name: string; components: Fields };
  for (const [component, options] of Object.entries(config.components)) {
    if (!isRecord(options)) throw new Error(`${first[0]}.components.${component}: not an object`);
    for (const [option, value] of Object.entries(options)) {
      if (option === 'icons') checkPartIcons(component, value);
      else checkOption(`${component}.${option}`, value);
    }
  }
  return config;
}

/** The fields of a `ModeCollection` (`@cocokits/shared`). Anything else is not a field of the modes index. */
const COLLECTION_FIELDS = ['name', 'attrName', 'componentName', 'modes', 'defaultMode'];

/** The `name`s of the modes of a collection; throws unless every mode has a name and a value. */
function modeNames(where: string, modes: unknown): unknown[] {
  if (!Array.isArray(modes) || modes.length === 0) throw new Error(`${where}: modes must be a non-empty list`);
  return modes.map((mode: unknown) => {
    if (!isRecord(mode) || !isText(mode['name']) || typeof mode['value'] !== 'string') {
      throw new Error(`${where}: every mode needs a name and a value`);
    }
    return mode['name'];
  });
}

function checkCollection(index: number, collection: unknown, seen: Set<string>): void {
  const position = `modeCollections[${String(index)}]`;
  if (!isRecord(collection)) throw new Error(`${position}: not an object`);
  const unknown = Object.keys(collection).filter((key) => !COLLECTION_FIELDS.includes(key));
  if (unknown.length > 0) throw new Error(`${position}: unknown field "${unknown.join('", "')}"`);
  const { name, attrName, componentName, modes, defaultMode } = collection;
  if (!isText(name)) throw new Error(`${position}: name must be text`);
  const where = `${position} (${name})`;
  if (typeof attrName !== 'string' || !ATTR_NAME.test(attrName)) {
    throw new Error(`${where}: attrName must match ${String(ATTR_NAME)}, got ${JSON.stringify(attrName)}`);
  }
  if (componentName !== undefined && !isText(componentName)) throw new Error(`${where}: componentName must be text`);
  const scope = componentName === undefined ? attrName : `${componentName}/${attrName}`;
  if (seen.has(scope)) throw new Error(`${where}: attrName "${attrName}" is listed twice`);
  seen.add(scope);
  if (!modeNames(where, modes).includes(defaultMode))
    throw new Error(`${where}: defaultMode is not the name of a mode`);
}

/** The theme's modes index, its `modeCollections` export, checked entry by entry. It is kept as the theme wrote it. */
export function modeCollectionsOf(exported: Fields, entry: string): unknown[] {
  const collections = exported['modeCollections'];
  if (collections === undefined) throw new Error(`${entry} exports no modeCollections (the theme's modes index)`);
  if (!Array.isArray(collections)) throw new Error(`${entry}: modeCollections must be a list`);
  const seen = new Set<string>();
  collections.forEach((collection: unknown, index) => {
    checkCollection(index, collection, seen);
  });
  return collections as unknown[];
}

/** The options of every component, without the part icons (`icons` is no option and stays out of `theme.json`). */
function optionsOnly(components: Fields): Fields {
  return Object.fromEntries(
    Object.entries(components).map(([component, options]) => [
      component,
      Object.fromEntries(Object.entries(options as Fields).filter(([name]) => name !== 'icons')),
    ]),
  );
}

/**
 * `ThemeDocData` of a theme: the options of its built `ThemeConfig` (never its part icons) and its `modeCollections`,
 * all from its built entry.
 *
 * @param root - The workspace root.
 * @param projectRoot - The absolute folder of the theme core package.
 */
export function themeDocsData(root: string, projectRoot: string): JsonFile[] {
  const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8')) as {
    exports?: Record<string, { default?: string } | string>;
  };
  const entry = packageJson.exports?.['.'];
  const file = typeof entry === 'string' ? entry : entry?.default;
  if (file === undefined) throw new Error('package.json has no "." export with a "default" file');
  const exported = loadBuiltModule(root, join(projectRoot, file), 'run the build first');
  const config = themeConfigOf(exported, file);
  const modeCollections = modeCollectionsOf(exported, file);
  return [
    {
      name: 'theme.json',
      data: {
        kind: 'theme',
        name: config.name,
        components: optionsOnly(config.components),
        modeCollections,
      },
    },
  ];
}
