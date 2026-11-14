import type { ExecutorContext } from '@nx/devkit';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { insideRoot } from '../inside-root';
import { emitTokens, mergeTokenFiles } from './emit';
import { emitModes } from './modes';
import type { TokensExecutorSchema } from './schema';
import type { TokenFile } from './types';

function writeFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

/**
 * Writes `output` from the token JSON `input` (one path or several, merged). With `modesOutput` it also writes the
 * TypeScript mode lists and the modes index. Every output is built and every path is checked before the first file
 * is written. Any build error is printed and fails the target.
 */
export default function tokensExecutor(
  options: TokensExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  try {
    const inputs = Array.isArray(options.input) ? options.input : [options.input];
    const output = insideRoot(context.root, options.output, 'output');
    const files = inputs.map(
      (path) => JSON.parse(readFileSync(insideRoot(context.root, path, 'input'), 'utf8')) as TokenFile,
    );
    const merged = mergeTokenFiles(files, inputs);
    const css = emitTokens(merged, options.format ?? 'css');
    const modesOutput = options.modesOutput && insideRoot(context.root, options.modesOutput, 'modesOutput');
    const modes = modesOutput ? emitModes(merged) : undefined;
    writeFile(output, css);
    if (modesOutput && modes !== undefined) writeFile(modesOutput, modes);
    return Promise.resolve({ success: true });
  } catch (error) {
    console.error(`tokens: ${error instanceof Error ? error.message : String(error)}`);
    return Promise.resolve({ success: false });
  }
}
