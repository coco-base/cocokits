# Cocokits AI Instructions Setup Guide

## Maintaining this repository with Codex

Start with the root [AGENTS.md](../AGENTS.md). It routes Codex to focused
[maintainer guides](codex/architecture.md) covering development, bug fixes, themes,
Storybook documentation, testing, and releases. Start a new Codex task in this
checkout to load the root guidance from the beginning; no global configuration
change is needed. These guides are based on repository source and build config.

The framework/theme files below serve a different audience: developers using
published Cocokits packages in their own applications. Keep consumer guidance
separate from repository maintenance instructions.

## Using Cocokits in another application

This directory contains modular AI instruction files designed to help AI coding assistants (like Cursor or GitHub Copilot) write better code using the `cocokits` library.

Because `cocokits` supports multiple frameworks (Angular, React) and multiple themes (Cocokits, Frames-X), these instructions are split into separate files. You must combine the files that match your project's specific stack.

## How to Use

1. **Choose your Framework:**
   - If you are using Angular, select `angular.cursorrules` (or `angular.copilot-instructions.md`).
   - If you are using React, select `react.cursorrules` (or `react.copilot-instructions.md`).

2. **Choose your Theme:**
   - If you are using the default Cocokits theme, select `cocokits-theme.cursorrules` (or `cocokits-theme.copilot-instructions.md`).
   - If you are using the Frames-X theme, select `frames-x-theme.cursorrules` (or `frames-x-theme.copilot-instructions.md`).

3. **Combine the Files:**
   Copy the contents of your chosen framework file and your chosen theme file, and paste them into a single file at the root of your project.
   - **For Cursor:** Create a file named `.cursorrules` at the root of your project.
   - **For GitHub Copilot:** Create a file named `copilot-instructions.md` at the root of your project (or add it to your `.github/` folder depending on your setup).

### Example (React + Frames-X Theme for Cursor)

If you are building a React app with the Frames-X theme, your `.cursorrules` file should look like this:

```markdown
# Cocokits React AI Instructions

[... contents of react.cursorrules ...]

---

# Frames-X Theme AI Instructions

[... contents of frames-x-theme.cursorrules ...]
```

## Why is this necessary?

By combining these files, you provide the AI with:

1. The correct installation and setup steps for your framework.
2. A summary of available components and instructions to read their exact types from your local `node_modules`.
3. Specific rules on how to optimize component props (like `size` or `variant`) for your chosen theme.
4. Strict instructions to read CSS tokens (colors, spacing, etc.) directly from your local `node_modules` instead of guessing or hardcoding values.
