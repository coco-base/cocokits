// Fails on a tracked text file that is not valid UTF-8, holds the replacement character (U+FFFD, left by a lossy
// decode) or holds the typical mojibake of UTF-8 read as Latin-1 (a lead letter A-tilde or A-circumflex followed by a
// Latin-1 continuation character). Run by `pnpm check:utf8` and by `pnpm ci:local`.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const TEXT = /\.(ts|tsx|js|jsx|mjs|cjs|vue|html|css|scss|md|mdx|json|jsonc|ya?ml)$/;
const MOJIBAKE = /[\u00c2\u00c3][\u0080-\u00bf]/;
const decoder = new TextDecoder('utf-8', { fatal: true });

const listed = spawnSync('git', ['ls-files', '-z'], { encoding: 'utf8', maxBuffer: 1 << 28 });
if (listed.status !== 0) {
  console.error(listed.stderr);
  process.exit(1);
}

const problems = [];
for (const file of listed.stdout.split('\0').filter((f) => TEXT.test(f))) {
  let text;
  try {
    text = decoder.decode(readFileSync(file));
  } catch {
    problems.push(`${file}: invalid UTF-8`);
    continue;
  }
  text.split('\n').forEach((line, index) => {
    if (line.includes('\ufffd')) problems.push(`${file}:${index + 1}: replacement character`);
    else if (MOJIBAKE.test(line)) problems.push(`${file}:${index + 1}: mojibake`);
  });
}

if (problems.length > 0) {
  console.error(`${problems.join('\n')}\nWrite every file as UTF-8 and fix the characters above.`);
  process.exit(1);
}
