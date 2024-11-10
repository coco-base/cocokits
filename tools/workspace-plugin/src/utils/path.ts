import tsPath from 'path';

function toPosixPath(path: string): string {
  return path.replace(/\\/g, '/');
}

function join(...paths: string[]): string {
  return toPosixPath(tsPath.join(...paths));
}

function relative(from: string, to: string): string {
  return toPosixPath(tsPath.relative(from, to));
}

function cwd(): string {
  return toPosixPath(process.cwd());
}

export const posixPath = {
  toPosixPath,
  join,
  relative,
  cwd,
};
