const TYPES = ['feat', 'fix', 'docs', 'perf', 'refactor', 'test', 'chore', 'story'];
const SCOPELESS = new Set(['chore', 'story']);

/** Scope required except for chore/story, which must not have one. A sub-scope may follow a project: `angular/button`. */
const scopeByType = (parsed) => {
  const { type, scope } = parsed;
  if (!type) return [true];
  if (scope && (/@/.test(scope) || scope.split('/').length > 2 || scope.split('/').some((part) => !part))) {
    return [false, `scope is "<project>" or "<project>/<sub-scope>" without the package prefix, got "${scope}"`];
  }
  if (SCOPELESS.has(type)) {
    return [!scope, `"${type}" must not have a scope`];
  }
  return [Boolean(scope), `"${type}" requires a scope, e.g. ${type}(machines): ...`];
};

/** Known AI agents and tools. */
const TOOL = String.raw`(?:claude(?:\s+code)?|codex|copilot|chatgpt|gpt|gemini|cursor|openai|anthropic|ai)\b`;
/** An attribution line starts (after optional emoji or punctuation such as "🤖 ", "- ", "> ") with one of these. */
const LINE_START = String.raw`^[^\p{L}\p{N}\r\n]*`;
const ATTRIBUTION = [
  String.raw`co-authored-by\s*:`,
  String.raw`(?:generated|assisted)\s+(?:with|by)\s+[^\p{L}\p{N}\r\n]*` + TOOL,
  String.raw`(?:made|written|created)\s+with\s+[^\p{L}\p{N}\r\n]*` + TOOL,
  String.raw`ai[-\s]?(?:assisted|generated)\b`,
].map((pattern) => new RegExp(LINE_START + pattern, 'imu'));

/** Commits carry no AI agent or tool attribution (author identity cannot be checked here). */
const noAttribution = (parsed) => {
  const hit = ATTRIBUTION.some((re) => re.test(parsed.raw ?? ''));
  return [!hit, 'remove "Co-Authored-By" trailers and AI/tool attribution lines (e.g. "Generated with ...")'];
};

/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [{ rules: { 'cocokits-scope-by-type': scopeByType, 'cocokits-no-attribution': noAttribution } }],
  rules: {
    'type-enum': [2, 'always', TYPES],
    'scope-empty': [0],
    'cocokits-scope-by-type': [2, 'always'],
    'cocokits-no-attribution': [2, 'always'],
  },
};
