/** The path with forward slashes, which the TypeScript and Angular tools expect on every OS. */
export const posix = (path: string): string => path.replaceAll('\\', '/');
