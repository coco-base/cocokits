import type { ExecutorContext } from '@nx/devkit';

/** The root folder of the project a target runs for, relative to the workspace root (`.` outside a project). */
export function projectRootOf(context: ExecutorContext): string {
  const name = context.projectName;
  return (name === undefined ? undefined : context.projectsConfigurations.projects[name]?.root) ?? '.';
}

/**
 * Replaces `{projectRoot}` and `{workspaceRoot}` in a path option. Nx does this in a run, but not in a direct call
 * (a test), so the executors do it too.
 */
export function expandOption(value: string, context: ExecutorContext): string {
  return value.replace(/\{projectRoot\}/g, projectRootOf(context)).replace(/\{workspaceRoot\}/g, '.');
}
