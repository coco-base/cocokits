## Nx tags
This documentation describes the tags used in the Nx library within your workspace, detailing the types of libraries and frameworks.
Additionally, it outlines the rules for inter-library dependencies as enforced by ESLint configuration.
These constraints ensure that dependencies within the workspace are managed systematically, reducing the risk of coupling unrelated codebases and streamlining build and deployment processes.

### Library Types & Rules

**type**

| Value   | Description                                                                                                  | Can Depend On                      |
|---------|--------------------------------------------------------------------------------------------------------------|------------------------------------|
| app     | A `app` type contains an application that can be built and served. Examples include websites, kit-docs, etc. | `type:ui` `type:theme` `type:util` |
| ui      | A `ui` library contains only presentational components, often referred to as "dumb" components.              | `type:theme` `type:util`           |
| theme   | A `theme` library includes style tokens and CSS/SCSS styles specific to a design system.                     | `type:theme`                       |
| util    | A `util` library offers low-level utilities used across various libraries and applications.                  | `type:util`                        |

**framework**

| Value      | Description                                                               | Can Depend On                          |
|------------|---------------------------------------------------------------------------|----------------------------------------|
| angular    | Angular-based projects. Libraries specific to Angular applications.       | `framework:angular` `framework:shared` |
| react      | React-based projects. Libraries specific to React applications.           | `framework:react` `framework:shared`   |
| web        | Libraries using standard web components.                                  | `framework:web` `framework:shared`     |
| shared     | Shared libraries that can be used across different frameworks.            | `framework:shared`                     |

