import { readJson, type Tree } from '@nx/devkit';
import { FRAMEWORK_INFO, type Framework } from './kinds';

export interface PeerRange {
  readonly low: string;
  readonly high: string;
}

export type Compatibility = Readonly<Record<string, PeerRange>>;

const VERSION = /^\d+\.\d+\.\d+$/;

/** Reads the `peers` of compatibility.json, the only place that names supported versions. */
export function readCompatibility(tree: Tree): Compatibility {
  if (!tree.exists('compatibility.json')) {
    throw new Error('compatibility.json not found at the workspace root; it is required for framework peers.');
  }
  const raw = readJson<{ peers?: Record<string, { low?: string; high?: string }> }>(tree, 'compatibility.json');
  const result: Record<string, PeerRange> = {};
  for (const [name, range] of Object.entries(raw.peers ?? {})) {
    const { low, high } = range;
    if (low === undefined || high === undefined || !VERSION.test(low) || !VERSION.test(high)) {
      throw new Error(`compatibility.json: peers["${name}"] needs "low" and "high" as x.y.z versions.`);
    }
    result[name] = { low, high };
  }
  return result;
}

function major(version: string): number {
  return Number.parseInt(version.split('.')[0] ?? '0', 10);
}

/** `^low` while low and high share a major, otherwise `>=low <(high major + 1).0.0`. */
export function peerRange({ low, high }: PeerRange): string {
  return major(low) === major(high) ? `^${low}` : `>=${low} <${String(major(high) + 1)}.0.0`;
}

function entryFor(compat: Compatibility, name: string): PeerRange {
  const range = compat[name];
  if (range === undefined) throw new Error(`compatibility.json has no peers["${name}"].`);
  return range;
}

/** Peer ranges of a framework's packages, e.g. react and react-dom. */
export function frameworkPeerRanges(compat: Compatibility, framework: Framework): Record<string, string> {
  return Object.fromEntries(FRAMEWORK_INFO[framework].peers.map((name) => [name, peerRange(entryFor(compat, name))]));
}

/** `high` versions of a framework's packages, for the dev tooling the workspace installs. */
export function frameworkHighVersions(compat: Compatibility, framework: Framework): Record<string, string> {
  return Object.fromEntries(FRAMEWORK_INFO[framework].peers.map((name) => [name, entryFor(compat, name).high]));
}
