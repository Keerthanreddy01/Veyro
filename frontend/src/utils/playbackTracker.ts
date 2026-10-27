/**
 * Veyro LMS — Client-Side Playback Traversal & Continuous Range Tracker
 */

export interface WatchedRange {
  start: number;
  end: number;
}

/**
 * Converts a Set of traversed integer seconds into sorted, disjoint [start, end] ranges.
 */
export function setToRanges(secondsSet: Set<number>): WatchedRange[] {
  if (!secondsSet || secondsSet.size === 0) return [];
  const arr = Array.from(secondsSet)
    .filter((n) => typeof n === 'number' && !isNaN(n) && n >= 0)
    .sort((a, b) => a - b);

  if (arr.length === 0) return [];

  const ranges: WatchedRange[] = [];
  let start = arr[0];
  let end = arr[0];

  for (let i = 1; i < arr.length; i++) {
    const val = arr[i];
    if (val === end) {
      continue;
    } else if (val === end + 1) {
      end = val;
    } else {
      ranges.push({ start, end });
      start = val;
      end = val;
    }
  }
  ranges.push({ start, end });
  return ranges;
}

/**
 * Reconstructs a Set of traversed integer seconds from stored ranges.
 */
export function rangesToSet(ranges?: WatchedRange[]): Set<number> {
  const set = new Set<number>();
  if (!Array.isArray(ranges)) return set;
  for (const r of ranges) {
    if (!r) continue;
    const s = Math.max(0, Math.floor(Number(r.start) || 0));
    const e = Math.max(s, Math.floor(Number(r.end) || 0));
    for (let i = s; i <= e; i++) {
      set.add(i);
    }
  }
  return set;
}

/**
 * Merges two range lists and returns the minimal disjoint set.
 */
export function mergeRanges(r1: WatchedRange[] = [], r2: WatchedRange[] = []): WatchedRange[] {
  const combined = [...(r1 || []), ...(r2 || [])];
  if (combined.length === 0) return [];

  const valid = combined
    .map((r) => ({
      start: Math.max(0, Math.floor(Number(r.start) || 0)),
      end: Math.max(0, Math.floor(Number(r.end) || 0)),
    }))
    .filter((r) => r.end >= r.start)
    .sort((a, b) => a.start - b.start || a.end - b.end);

  if (valid.length === 0) return [];

  const merged: WatchedRange[] = [];
  let current = { ...valid[0] };

  for (let i = 1; i < valid.length; i++) {
    const next = valid[i];
    if (next.start <= current.end + 1) {
      current.end = Math.max(current.end, next.end);
    } else {
      merged.push(current);
      current = { ...next };
    }
  }
  merged.push(current);
  return merged;
}
