import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

// Zoneless TestBed (no zone.js). Tests await `fixture.whenStable()` after a change.
setupTestBed();
