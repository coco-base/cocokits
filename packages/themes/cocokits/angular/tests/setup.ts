import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

// Zoneless TestBed (no zone.js). Tests await `fixture.whenStable()` after a change.
// A server-render test runs in the node environment (no `document`) and must not get the
// browser test platform, so the setup is skipped there.
if (typeof document !== 'undefined') setupTestBed();
