import type { ApiDocJson, ApiMemberJson, ApiPartJson, ApiSlotJson, ApiSymbolJson, ApiTypeJson } from './types';

/** The most words a sentence may have; a code span counts as one word. */
export const MAX_WORDS = 25;
/** The most sentences the first paragraph (the description) may have; more text goes to the remarks. */
export const MAX_FIRST_SENTENCES = 3;

/** Words and contractions the text may not use, outside code. */
const NOT_ALLOWED =
  /(?<![\w.])(e\.g\.|i\.e\.|etc\.|via|just|simply|easily|obviously|basically|utilize|leverage)(?![\w])|\b(?:it|that|there|here|what|let)['’]s\b|\b\w+(?:n['’]t|['’](?:re|ll|ve))\b/i;

/** The text with each fenced block removed and each code span as one word, so code is neither counted nor checked. */
function prose(text: string): string {
  return text.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, 'CODE');
}

/** The sentences of a text: paragraphs, list items and sentences that end with `.`, `!` or `?`. */
export function sentencesOf(text: string): string[] {
  return prose(text)
    .split(/\n\s*\n|\n\s*(?=[-*] |\d+\. )|(?<=[.!?])\s+(?=[A-Z"'(])/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence !== '');
}

const wordsOf = (sentence: string): number => sentence.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;

/** Adds a problem for each sentence over {@link MAX_WORDS} words and for a word that is not allowed. */
function checkProse(label: string, text: string | undefined, problems: string[]): void {
  if (text === undefined) return;
  for (const sentence of sentencesOf(text)) {
    const words = wordsOf(sentence);
    if (words > MAX_WORDS)
      problems.push(`${label}: a sentence has ${String(words)} words (${String(MAX_WORDS)} at most)`);
  }
  const word = NOT_ALLOWED.exec(prose(text));
  if (word !== null) problems.push(`${label}: "${word[0]}" is not allowed (text rules)`);
}

/** Checks a description (the first paragraph), its remarks and the meanings of its values. */
function checkText(
  label: string,
  item: { description: string; remarks?: string; values?: readonly { value: string; description: string }[] },
  problems: string[],
): void {
  checkProse(label, item.description, problems);
  const sentences = sentencesOf(item.description).length;
  if (sentences > MAX_FIRST_SENTENCES)
    problems.push(`${label}: the first paragraph has ${String(sentences)} sentences; move the rest to @remarks`);
  checkProse(`${label} (remarks)`, item.remarks, problems);
  for (const value of item.values ?? []) checkProse(`${label} @cckValue ${value.value}`, value.description, problems);
}

/** The members of a union at its top level, outside brackets, generics and function types. */
export function unionMembersOf(type: string): string[] {
  const members: string[] = [];
  let depth = 0;
  let quote = '';
  let start = 0;
  for (let index = 0; index < type.length; index += 1) {
    const char = type.charAt(index);
    if (quote !== '') {
      if (char === quote) quote = '';
    } else if (char === '"' || char === "'") quote = char;
    else if ('([{<'.includes(char)) depth += 1;
    else if (')]}>'.includes(char) && type.charAt(index - 1) !== '=') depth -= 1;
    else if (char === '|' && depth === 0) {
      members.push(type.slice(start, index).trim());
      start = index + 1;
    }
  }
  return [...members, type.slice(start).trim()].filter((member) => member !== '');
}

/**
 * The literals of a literal union, without their quotes: the string and number members of a union with at least one
 * literal and one other member that is not `undefined` or `null`. A single literal is no union and has none.
 */
export function unionLiteralsOf(type: string): string[] {
  const members = unionMembersOf(type).filter((member) => member !== 'undefined' && member !== 'null');
  const literals = members.flatMap((member) => {
    const match = /^(?:(['"])(.*)\1|(-?\d+(?:\.\d+)?))$/.exec(member);
    return match === null ? [] : [match[2] ?? match[3] ?? ''];
  });
  return members.length >= 2 ? literals : [];
}

function checkValues(label: string, type: string, values: ApiMemberJson['values'], problems: string[]): void {
  const named = new Set((values ?? []).map((value) => value.value));
  const missing = unionLiteralsOf(type).filter((literal) => !named.has(literal));
  if (missing.length > 0) problems.push(`${label}: no @cckValue for ${missing.map((m) => `'${m}'`).join(', ')}`);
}

const NOT_SET = /(^|[.!?]\s+)When not set\b/;
const saysNotSet = (member: ApiMemberJson): boolean => NOT_SET.test(`${member.description}\n\n${member.remarks ?? ''}`);
const needsExample = (label: string, member: { examples?: readonly string[] }, problems: string[]): void => {
  if ((member.examples ?? []).length === 0) problems.push(`${label}: needs an @example`);
};

/**
 * Whether an event payload is an object or a named type: the parameters of the event type (a function or a tuple)
 * name a type or hold an object literal, and are not only primitives and literals.
 */
export function hasObjectPayload(type: string): boolean {
  const payload = type
    .replace(/=>\s*void/g, '')
    .replace(/'[^']*'|"[^"]*"/g, '')
    .replace(/[\w$]+\??\s*:/g, '');
  return /\{|\b[A-Z][\w$]*\b/.test(payload);
}

function checkMember(label: string, member: ApiMemberJson, problems: string[]): void {
  checkText(label, member, problems);
  checkProse(`${label} (deprecated)`, member.deprecated, problems);
  checkValues(label, member.type, member.values, problems);
}

function checkSlot(label: string, slot: ApiSlotJson, framework: ApiDocJson['framework'], problems: string[]): void {
  checkMember(label, slot, problems);
  if (slot.default !== undefined)
    problems.push(`${label}: a slot has no @defaultValue; say what shows without it in a "When not set, …" sentence`);
  if (!saysNotSet(slot)) problems.push(`${label}: a slot needs a "When not set, …" sentence`);
  // An Angular content slot is a `@cckSlot` tag, which holds no example; the root example shows it.
  if (framework !== 'angular' || slot.selector?.startsWith('ng-template') === true) needsExample(label, slot, problems);
  for (const field of slot.scope ?? []) checkProse(`${label} scope ${field.name}`, field.description, problems);
}

function checkPart(doc: ApiDocJson, part: ApiPartJson, problems: string[]): void {
  const label = `${doc.framework}/${doc.component} ${part.name}`;
  checkText(label, part, problems);
  if (part.semanticId.endsWith('.root')) needsExample(`${label} (root part)`, part, problems);
  for (const prop of part.props) {
    checkMember(`${label}.${prop.name}`, prop, problems);
    if (!prop.required && prop.default === undefined && !saysNotSet(prop))
      problems.push(
        `${label}.${prop.name}: optional with no default; say what happens in a "When not set, …" sentence`,
      );
  }
  for (const event of part.events) {
    checkMember(`${label}.${event.name}`, event, problems);
    if (hasObjectPayload(event.type)) needsExample(`${label}.${event.name} (object payload)`, event, problems);
  }
  for (const slot of part.slots) checkSlot(`${label} slot ${slot.name}`, slot, doc.framework, problems);
  for (const method of part.methods) {
    checkMember(`${label}.${method.name}()`, method, problems);
    needsExample(`${label}.${method.name}()`, method, problems);
  }
}

function checkSymbol(doc: ApiDocJson, symbol: ApiSymbolJson, problems: string[]): void {
  const label = `${doc.framework}/${doc.component} ${symbol.kind} ${symbol.name}`;
  checkText(label, symbol, problems);
  if (symbol.kind === 'constant') needsExample(label, symbol, problems);
  for (const prop of symbol.props) checkMember(`${label}.${prop.name}`, prop, problems);
  for (const method of symbol.methods) {
    checkMember(`${label}.${method.name}()`, method, problems);
    needsExample(`${label}.${method.name}()`, method, problems);
  }
}

function checkType(doc: ApiDocJson, type: ApiTypeJson, problems: string[]): void {
  const label = `${doc.framework}/${doc.component} type ${type.name}`;
  checkText(label, type, problems);
  if (type.text !== undefined) checkValues(label, type.text, type.values, problems);
  for (const field of type.fields) checkMember(`${label}.${field.name}`, field, problems);
}

/**
 * The text rules of the API text an extractor read (style guide `tsdoc.md`): sentence length, first paragraph,
 * words that are not allowed, required examples, a `@cckValue` per literal, the "When not set, …" sentence of an
 * optional prop and of a slot, and no slot `@defaultValue`. One problem per broken rule, naming the item.
 */
export function textRuleProblems(doc: ApiDocJson): string[] {
  const problems: string[] = [];
  for (const part of doc.parts) checkPart(doc, part, problems);
  for (const symbol of doc.symbols ?? []) checkSymbol(doc, symbol, problems);
  for (const type of doc.types ?? []) checkType(doc, type, problems);
  return problems;
}
