// D-019: @cocokits/angular has no "." export. ng-packagr always builds a primary entry point (src/index.ts),
// so its export and the root-only module/typings fields are removed from the built package.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const file = join(import.meta.dirname, '..', '../../dist/packages/angular', 'package.json');
const pkg = JSON.parse(readFileSync(file, 'utf8'));

if (pkg.exports) delete pkg.exports['.'];
delete pkg.module;
delete pkg.typings;

writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
