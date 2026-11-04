# Playground controls and code snippets

Purpose: where playground controls and the shown code come from, and the one layout rule for printed markup. Stories are compiled from one source ([stories-and-scenarios.md](./stories-and-scenarios.md)); nothing here is written per framework.

## Controls

Controls come from the compiled `StoryMeta.args` of the playground, and of a custom story that declares `args` ([Args](./story-language.md#args)), in the selected framework and theme. The compiler builds the args of the playground from the extracted `ApiDoc` ([api-extraction.md](./api-extraction.md)) and the theme's `ThemeConfig`; the args of a custom story come from its `args` and `argValues`. The playground maps its sources to controls like this:

| Prop type in `ApiDoc` | Control |
|---|---|
| Union of string literals | Native select |
| `boolean` | Switch |
| `string` / `number` | Text / number field |
| Theme option from `ThemeConfig` (`size`, `variant`, ...) | Select (switch for a boolean option) |
| Function, object, template / slot | No control; listed in the API table only |

- The controls panel has no group headings: the theme options come first, then the props, in the order of the args.
- A story config's `hideControls` removes the controls of the listed props and options ([stories-and-scenarios.md](./stories-and-scenarios.md)). Each control is a live or an initial arg ([preview-protocol.md](./preview-protocol.md)); an initial control shows "resets the example".
- A control change sends `setArgs`; the iframe is never reloaded for a live arg.
- Args are named by the neutral names (the semantic ids), so switching the framework keeps the same control values.
- A model (a prop with a `bindings` entry or a `<id>Change` event, such as `checked` or `value`) has no live control: a literal would make the story controlled, so a user change would be undone. Its control sets the initial value and is named `default<Model>` after the model's semantic id (`checkbox.checked` gives `defaultChecked`, `input.value` gives `defaultValue`), in all three frameworks, because React's own `defaultChecked` is `@cckSemantic none`. It is an initial arg, so a change remounts the story. A model whose React part lacks the prop is a [`missing-convention`](./story-language.md#errors) error.
- A list model (the Select) has the same `defaultValue` control: a select of the values of the sample's items and "none". Under a literal `multiple` the chosen value is the start list of one item, in the run mode and in the inline code. `value` stays hidden.
- Do not write per-component control code; fix the TSDoc, the `ThemeConfig` or the story config instead.

## The code panel

The code panel of a story shows `StoryMeta.files[].code`: the generated file of the selected framework and theme, without its `GENERATED` header, highlighted at build time. The code shown is the inline code the compiler prints from the same source as the run module. The run module differs from it in exactly two ways, both for the preview and both pinned by compiler tests: a story with args binds them as inputs or props, and a component with semantic events gets one `report` statement per event appended to that event's handler (created when the author wrote none) for the Events panel. Nothing else is added to the run module.

- A story without args and without component events prints the same file in both modes.
- The playground, and a custom story that declares args, have args. Their module binds them (inputs, props), and the panel shows the **inline** code: the args are replaced by their values. The playground leaves out the values the component has anyway; a custom story keeps every value, because its default belongs to the story, not to a component.
- There are no markers in the files and no hand-written excerpts.

## The playground snippet

The snippet of a story with args reflects the current control values, so it cannot be a fixed file. `StoryMeta.files[0].snippet` is a **snippet template**: the inline code with the args left open. The playground and a custom story with args have one. The page fills it in the browser with `renderSnippet(template, currentArgs)` from `@cocokits/shared` and shows the result.

- An arg prints as the attribute for its value (`size="lg"`, `disabled`, `maxlength="3"`) or, in the playground, as nothing for the value the component has anyway. An arg of a custom story always prints its value, even at its default (the `default` of its hole is left out), so the code shows the whole story. A `select` or `switch` value is looked up among the template's own entries only. A number control accepts finite numbers only; any other value prints nothing.
- A text or number value is escaped for the template's framework, with the same function the compiler uses for literal values: an Angular template needs `{{`, `@`, backslashes, backticks and `${` escaped, because it sits in a template literal.
- **Script holes.** An arg that the code around the markup reads (a `derived` value, `const left = 80 - message.length`) is a hole in `SnippetTemplate.script`, whose `before` and `after` are lists of text and arg holes; `renderSnippet` fills `script` and ignores `before` and `after`, which keep the code of the default args for the readers that do not know `script`. The hole has the `script` escape: a string prints as a TypeScript string literal (the function the compiler uses for every string of the code), a number or a boolean as it is. A bare string or number arg in text is a text hole: the same hole as an arg attribute, filled with the `text` escape (`angular` in an Angular template), with no default, so its line is marked on every render. A null, missing or empty value, or a value of only spaces, tabs or line breaks, prints and marks nothing, because Angular and Vue drop such a text node and the shown code must agree with the filled one; an Angular value writes a `{` or `}` at its start or end as `{{ '{' }}` so that two neighbouring holes cannot join their braces into an interpolation. Expressions over args and `when` conditions go through a `derived`, so the page fills values and prints no expression ([Args](./story-language.md#args)).
- A cleared number control sends the default of the arg, or `null` when it has none. A custom story's arg always has a default, so neither the running story nor `renderSnippet` ever gets `null` for it.
- `renderSnippet` also returns `changedLines`: the 0-based lines, each once, that print an arg. An arg with a `default` prints only when its value differs from it; an arg of a custom story always prints, so its lines are listed at the defaults too. The page marks only the lines that differ from the same lines rendered with the defaults (`codeView`), so the defaults and Reset show no marked line in any story.
- The snippet is highlighted in the browser like the story code is at build time: the same grammar and the same code theme (`apps/docs/src/lib/shiki-theme.ts`), through Shiki's fine-grained core with the JavaScript regex engine and only the grammar of the file, loaded when the page is idle. Until it is ready the snippet keeps the build's highlighting; if it fails the lines are plain text.
- The compiler tests that `renderSnippet` equals the inline code for the defaults and for every control at each non-default value, in all three frameworks. A change to the printers or the template breaks that test, not the page.
- Theme options are printed on the theme wrapper or directive of the selected theme, from `ThemeConfig`.
- A snippet template cannot follow `multiple` as an arg: with `multiple` as a playground arg the snippet prints the single-value form of `defaultValue`, while the live preview and the inline code print the list.

## Layout of printed markup

One layout rule serves the compiler (code it prints) and `renderSnippet` (code the page fills): `layoutMarkup` from `@cocokits/shared`. Prettier does not run in the page, so nothing else lays out markup.

- Indent by 2 spaces per level.
- An opening tag that fits in 120 columns keeps its attributes on one line; otherwise it prints one attribute per line, with the closing `>` (or `/>`) on a line of its own.
- Text-only content stays on the element's line when the whole element fits in 120 columns; otherwise it goes on its own line, without the spaces at its ends. Element children always go on their own lines.
- Text beside elements, and text inside an inline element (`a`, `span`, `label`, `strong`, `code` and the like), is an inline run. The whole element prints on one line when it fits in 120 columns, exactly as written, and otherwise breaks only as the next item says, because a line break would change the words the frameworks render: Angular and Vue read it as a space, React drops it.
- A run that does not fit in 120 columns breaks only where no text stands next to the break: between two sibling elements, after the opening tag when the first node is an element, and before the closing tag when the last node is an element. All three frameworks drop a text node of layout white space that holds a line break between two elements (Angular `preserveWhitespaces: false`, Vue `whitespace: 'condense'`, JSX), so the rendered text stays the same. An element whose children are all elements (`svg`, `ul`) prints them one per line inside such a run. A break never goes next to text, a text hole or a conditional block; a run with no place to break stays on one line, however long. The attributes of its opening tag still wrap by the rule above, and the run follows the closing `>`. At the top level, text beside elements makes the whole markup one run on one line, without the layout spaces at its ends. Angular prints a space that stands alone between two elements as `&ngsp;`, because it drops a text node that is only layout white space.
- Layout white space is the ASCII space, tab, line feed, carriage return and form feed, here and in the printers. A no-break space is text: no rule trims or replaces it, and the compiler prints it as `&nbsp;`. The layout has no rule for white-space-sensitive elements (`pre`, `textarea`): the story vocabulary leaves them out, and a snippet template must not use them.
- An element marked `selfClosing` with no children prints `<x … />`. Any other empty element prints `<x></x>` on one line when it fits; otherwise the opening tag is laid out by its own width, and `</x>` follows on a line of its own.
- A component prints like an element. A component nested in a component or an element follows the same rules, in the code files, the inline code of the panel and the snippet template: element children on their own lines, and text beside a nested component makes the whole element one inline run (`<Button>Inbox <Badge content={5} /></Button>`).
- An attribute that holds markup (a React slot prop, `label={<Label>Email</Label>}`) stays on the opening tag's line when its markup lays out as one line and the whole opening tag fits in 120 columns. Otherwise the opening tag wraps, and the attribute prints `name={` on its line, its markup one level deeper by these same rules, and `}` at the attribute's indent. A non-default arg inside the markup marks only the lines that print it. A scoped-slot arrow (`preview={({ selected }) => <>…</>}`) prints on one line when its content is one line and the line fits in 120 columns; the printer names that one-line form in the block's `flat` field.
- A conditional block (`conditionalLines`) prints its opening line, its content one level deeper, the `middle` line and the `otherwise` content, and its closing line. A block with text of its own, in either branch, and a block inside an inline run print on one line, `@if (open()) {Open} @else {<b>Closed</b>}`, because a line break would add a space to the text in Angular.
- The fixed parts of a file (imports, class, props) are already formatted by the printers. The imports follow [Several components in one story](./stories-and-scenarios.md#several-components-in-one-story).

## Generated stories must compile

- The compiler's tests compile the printed code of every framework against the real packages: `ngc` with `strictTemplates` for Angular, `tsc` for React and `vue-tsc` for Vue, over the real Button, Badge and BadgeContainer and the real cocokits theme layers. A theme value the component does not accept fails each check. The tests that cover composed stories read the real generated `ApiDoc` and theme data (the `test` target depends on `api-docs` and `docs-data`) and add no fixture. The older Field tests still use a hand-written Field of the same shape until a real component replaces it.
- A preview app compiles its generated stories in its own build and type check.
- The consumer fixture compiles the shown code of every story (every `files[].code` from the story's `.json`, written under its `files[].name`, with the registry: a React story with styles has the module and its `.css` file) against the packed packages. The run module is compiled by each preview app's build ([tooling](../../why/tooling.md#the-consumer-fixture-is-built-once-for-all-frameworks)). Run it with `pnpm nx run consumer-fixture:check` ([targets.md](../workspace/targets.md)).
