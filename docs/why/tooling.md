# Why: tooling

Rules: [Generators](../style-guides/workspace/generators.md), [TSDoc](../style-guides/framework-agnostic/tsdoc.md) and [Single source of truth](../architecture.md#8-single-source-of-truth). This file explains them and states no rules.

## One library generator for packages and entry points

**Rejected alternatives.**
- *Generators for components and scenarios up front.* Not added until the same files are written by hand repeatedly.

**Why.**
- Package scaffolding is the same for every package of a kind and is known from the guides. Hand-written `project.json`, `exports` keys, tsconfigs and size-limit entries would differ from package to package, so the generator exists from the first package.
- A generator runs once. Its output is then normal source code.

## Extractor output below `dist`

Rule: [API extraction, pipeline](../style-guides/workspace/api-extraction.md#pipeline).

**Rejected alternatives.**
- *Write the extracted data next to the sources, in a git-ignored `src/generated/` folder of each project.* A reader of the JSON, such as a documentation site in another repository, would have to know the layout of every package.
- *Commit the extracted data.* It is derived from TSDoc, tokens and machines, so a committed copy drifts and every source change would also change a generated file.
- *Extract in a step that only CI runs.* The author could not see the data before the push.

**Why.** Each target writes into `dist/api-docs/<project>` or `dist/docs-data/<project>` at the workspace root, and Nx declares that folder as the output of the target, so a cache hit restores it and a clean run regenerates it. One folder per kind and project gives a consumer two paths to read, whatever the package layout. The shape of the files is the contract with the consumer and does not depend on where they are written.

## API descriptions only in TSDoc

**Rejected alternatives.**
- *A hand-written props list in a meta file.*

**Why.** A hand-written list drifts from the real code. TSDoc sits on the source, so the description changes in the same edit as the symbol. A theme option's default and values live only in the theme's `ThemeConfig`, so the TSDoc of a theme layer does not restate them, and a contributor tells theme options from base inputs by reading the component code and the theme config, not from a list in the guide: a second copy of the default would drift from the config the documentation and the runtime read.

## React API through the TypeScript checker

Rule: [API extraction, pipeline](../style-guides/workspace/api-extraction.md#pipeline).

**Rejected alternatives.**
- *API Extractor's doc model for React.* It follows `Omit`, `Pick` and extended interfaces only in part, so a prop picked from a machine type could lose its text and default.
- *A hand-written props list.* It drifts from the code ([API descriptions only in TSDoc](#api-descriptions-only-in-tsdoc)).

**Why.**
- The checker resolves a props type like the compiler does, with the declaration of each property. A prop picked from a machine type keeps the machine's TSDoc, and a property declared in `node_modules` or the TypeScript library (the native button props) is left out by its declaration file, not by a name list.
- Vue has its own tool (`vue-component-meta`) for the same reason: it reads what the Vue compiler resolves.
- The parity check fails on members (slots included), `required` and `default`, and reports types only: type spellings differ across frameworks. A slot that exists in one framework by design is marked `none` and left out.
- A difference by design is written on the member or part that causes it, not in a list in the checker. A default that differs because each framework reads it from another holder (Angular token `0`, React and Vue Provider `700`) is `@cckDefaultDiffers <reason>`: the check reports it, and a default difference without the tag still fails, so a drift nobody meant is not hidden. A part only some frameworks have (the Tooltip Provider) is `@cckSemantic none` on the part, as on a member. The Accordion root members stay in `LACKING_BY_DESIGN` because React and Vue use those ids as the canonical ones for their controls; tagging them `none` would remove them from both. A root member that names another part (`tooltip.content.aria-label` on the Angular root) is compared with that part, because the Angular one-attribute form has no separate content input.
- A React controlled `value` has no default: an omitted `value` means uncontrolled, and `defaultValue` carries the start value. Angular and Vue model the value with a default (`''`). Stating `''` on the React `value` would be false, so the parity check leaves that one default out of the comparison instead of the TSDoc lying to satisfy it.

## Lint exceptions live in one file

**Rejected alternatives.**
- *`eslint-disable` comments with a written reason.* They scatter across files, so nobody can list or audit them, and a comment is the easiest way to get a check green.

**Why.** One config file lists every file that may break a rule, each with its reason, so a reviewer sees a new exception in one diff and the list can be audited. A comment hides the same decision inside the code it excuses.

## Guides never name versions

**Why.** Guides must stay valid across framework upgrades. A version number in a guide is out of date after the next release. Supported versions live in `peerDependencies` and the workspace `package.json`.

## One pipeline, run in CI and locally

**Rejected alternatives.**
- *Check only on a release.* A broken export map, wrong types or a bundle that doubled in size would be found after the merge.
- *A list of checks in the workflow and another in the contributor guide.* The two drift, and a change passes locally and fails on GitHub.

**Why.** `tools/scripts/ci-local.mjs` owns the list of checks and `.github/workflows/ci.yml` runs the same list, so a contributor can reproduce a failed run. The publish checks work on the packed tarball (`pnpm pack`), because that is the artefact npm receives: publint checks the `package.json` and the files, and Are the Types Wrong checks how each module resolution mode finds the types. A change to the package manifest, the build output or an entry point is then found in the pull request.
