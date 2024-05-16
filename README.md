# coco-kits

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


## Contributing

We encourage contributions to enhance and expand the capabilities of our common utilities. To contribute:

1. **Fork the Repository:** Start by forking the repository and cloning your fork to your local machine.
2. **Create a Feature Branch:** Make your changes in a new git branch.
3. **Implement Your Changes:** Add new features or fix bugs, ensuring you adhere to the coding standards established in the workspace.
4. **Write Tests:** Update existing tests or add new ones to cover your changes. This helps maintain reliability and stability.
5. **Document Changes:** Update the README or any relevant documentation within the package to reflect your changes.
6. **Update Changes Log:** Use `changesset` to add all changes log.
7. **Submit a Pull Request:** Push your changes to your fork and open a pull request against the main repository.

Please ensure that your contributions follow the coding standards and commit guidelines outlined in the main repository documentation.
Your changes should also pass all existing tests and, where possible,
