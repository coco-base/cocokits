# Testing style guide

How CocoKits code is tested: which kind of test covers what, where tests live and the rules every test follows. The test kinds and the "explicit assertions, no catch-all DOM snapshots" rule are in [architecture.md](../../architecture.md) (section 9). Commands are in [targets.md](../workspace/targets.md). Framework rules are in the framework guides ([angular](../angular/index.md), [react](../react/index.md), [vue](../vue/index.md)); accessibility rules in [accessibility](../accessibility/index.md).

## The two test kinds

Unit tests (utils, shared, cdk, machines) and component tests (a framework component rendered in a DOM) are defined in [architecture.md](../../architecture.md) (section 9). Unit tests live in the package's `tests/` folder; component tests in the framework package. Both run with `pnpm nx run <project>:test` (Vitest).

Each package's `test` target runs its own Vitest config. Framework-free layers (`utils`, `shared`, `cdk`, `machines`) have no DOM or framework dependencies in production code. Their test files may use a DOM test environment (for example jsdom) as a dev/test-only dependency where the module touches the DOM; add it in that package.

## End-to-end tests

Browser tests of the built docs site are a separate kind. They live in the project `apps/docs-e2e`, in `tests/`, are written with Playwright Test and are named `<area>.spec.ts` (`chrome.spec.ts`, `workbench.spec.ts`); helpers sit in `tests/support/`. Run them with `pnpm nx run docs-e2e:e2e`, which builds the site first ([targets.md](../workspace/targets.md#docs-targets)). Vitest never runs them: its files are `*.test.*` inside their own project.

- One behaviour per `test()`, grouped by area in `test.describe`. Test titles follow the rules below.
- The project imports no repo source ([tags and boundaries](../workspace/nx-tags-and-boundaries.md)): it reads the site through the DOM, with real key presses, and selects by the public classes and `data-*`.
- The tests start only once the page scripts have run (`openDocs`), unless they test the time before.
- One worker and no retries: the tests share one server and a failure is a failure. Never a fixed wait for a state that can be waited for; a wait that lets an animation or a frame move settle is commented.
- The browser is Playwright's Chromium (`pnpm exec playwright install chromium` once), or the Chrome that `CHROME_PATH` names. The `overlays` configuration also runs Firefox and WebKit (`pnpm exec playwright install firefox webkit` once).
- Bring a story into view by its story block (`#story-<id>`), never by the iframe inside it: a story section is `content-visibility: auto`, and WebKit cannot scroll to an element inside a skipped section, so a lazy frame there never loads.

## Rules

Rules every test follows (unit and component):

- `it.each` with object rows for table-driven cases; never register tests in a loop with `forEach`.
- Fake timers for time; never a real wait.
- Do not mock internal modules; test one level up.
- Unexpected `console.error` / `console.warn` fails the test; expected warnings are asserted with a spy.
- Test titles say what the body asserts; a test lives in the file of the part or unit whose behaviour it asserts.
- A criterion about stacking, visibility or covering ("above", "visible", "not clipped") is asserted with a hit test (`elementFromPoint` at the part's centre) or a screenshot, never with `toBeVisible` or box geometry alone.
- Every new test is seen failing once (break the code, watch it fail, revert); every bug fix adds a test that reproduces the report.

Kind-specific rules: [component-tests](./component-tests.md) (setup, queries, what to cover, test-writing rules) and [unit-tests](./unit-tests.md). Review stays proportional: a runtime change runs the tests of the affected package and of packages that depend on it (`pnpm nx affected -t test`); a docs-only change needs no test run. Never report a check you did not run.

## Load on demand

| File | Load when |
|---|---|
| [unit-tests.md](./unit-tests.md) | Testing a util, a shared helper, a cdk module or a machine |
| [component-tests.md](./component-tests.md) | Testing a framework component: setup, queries, what to cover, forms, SSR and hydration |
| [accessibility-checks.md](./accessibility-checks.md) | What automated tests can prove about accessibility, and what stays manual |
