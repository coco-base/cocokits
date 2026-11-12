// Fails on a tracked text file that is not valid UTF-8, holds the replacement character (U+FFFD, left by a lossy
// decode) or holds mojibake: UTF-8 read as Latin-1 or Windows-1252 and written back (for example the sequences a
// lead letter A-tilde or a-circumflex then Latin-1 or Windows-1252 symbols). A file with a NUL byte is binary and
// skipped. Run by `pnpm check:utf8` and by `pnpm ci:local`.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** The characters a Windows-1252 decode gives the bytes 0x80-0xBF (Latin-1 symbols and the cp1252 punctuation). */
const CONTINUATION =
  '[\u0080-\u00bf\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013\u2014\u2018-\u201a\u201c-\u201e\u2020-\u2022\u2026\u2030\u2039\u203a\u20ac\u2122]';
/** Two-byte characters (lead C2 or C3) and three-byte characters (lead E2) read as single-byte text. */
const MOJIBAKE = new RegExp(`[\u00c2\u00c3]${CONTINUATION}|\u00e2${CONTINUATION}{2}`);
const decoder = new TextDecoder('utf-8', { fatal: true });

/** The problems of one file as `path[:line]: what` texts; empty for a clean or binary file. */
export function findProblems(file, bytes) {
  if (bytes.includes(0)) return [];
  let text;
  try {
    text = decoder.decode(bytes);
  } catch {
    return [`${file}: invalid UTF-8`];
  }
  const problems = [];
  text.split('\n').forEach((line, index) => {
    if (line.includes('\ufffd')) problems.push(`${file}:${index + 1}: replacement character`);
    else if (MOJIBAKE.test(line)) problems.push(`${file}:${index + 1}: mojibake`);
  });
  return problems;
}

function main() {
  const listed = spawnSync('git', ['ls-files', '-z'], { encoding: 'utf8', maxBuffer: 1 << 28 });
  if (listed.status !== 0) {
    console.error(listed.stderr);
    process.exit(1);
  }
  const problems = [];
  for (const file of listed.stdout.split('\0').filter(Boolean)) {
    let bytes;
    try {
      bytes = readFileSync(file);
    } catch {
      continue; // deleted in the working tree
    }
    problems.push(...findProblems(file, bytes));
  }
  if (problems.length > 0) {
    console.error(`${problems.join('\n')}\nWrite every file as UTF-8 and fix the characters above.`);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
