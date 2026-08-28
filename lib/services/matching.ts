import { LOCATIONS } from '../seed';
import type { ItemMatch, ItemReport } from '../types';
const STOP = new Set([
  'the',
  'and',
  'with',
  'from',
  'found',
  'lost',
  'near',
  'black',
  'white',
  'blue',
  'green',
  'my',
  'our',
  'in',
  'at',
  'on',
  'of',
  'a',
  'an',
  'to',
  'is',
  'it',
  'was',
  'after',
  'during',
  'left',
  'last',
  'seen',
  'building',
  'campus',
]);
const tokens = (text: string) =>
  new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP.has(t)),
  );
const colorFamily = (color: string) =>
  ({
    navy: 'blue',
    beige: 'cream',
    gray: 'grey',
    silver: 'grey',
    ivory: 'cream',
  })[color.toLowerCase()] || color.toLowerCase();
const active = (r: ItemReport) =>
  !['Draft', 'Returned', 'Rejected', 'Unclaimed', 'Ready for Pickup'].includes(
    r.status,
  );
export function scoreMatch(
  lost: ItemReport,
  found: ItemReport,
): ItemMatch | null {
  if (
    lost.type !== 'lost' ||
    found.type !== 'found' ||
    !active(lost) ||
    !active(found) ||
    lost.reporterId === found.reporterId
  )
    return null;
  const days = (Date.parse(found.date) - Date.parse(lost.date)) / 86400000;
  if (
    !Number.isFinite(days) ||
    days < 0 ||
    days > 30 ||
    lost.category !== found.category
  )
    return null;
  let score = 30;
  const reasons = [`Same category: ${lost.category}`];
  const a = tokens(lost.title + ' ' + lost.description),
    b = tokens(found.title + ' ' + found.description);
  const common = [...a].filter((t) => b.has(t));
  const overlap = common.length / Math.max(1, Math.min(a.size, b.size));
  if (overlap > 0) {
    score += Math.round(Math.min(1, overlap * 1.5) * 25);
    reasons.push('Similar item name and description');
  }
  if (colorFamily(lost.color) === colorFamily(found.color)) {
    score += 15;
    reasons.push(`Same or similar color: ${found.color.toLowerCase()}`);
  }
  const l = LOCATIONS.find((v) => v.id === lost.locationId),
    f = LOCATIONS.find((v) => v.id === found.locationId);
  if (lost.locationId === found.locationId) {
    score += 15;
    reasons.push('Found at the reported location');
  } else if (l && f && l.zone === f.zone) {
    score += 8;
    reasons.push('Found nearby, in the same campus zone');
  }
  if (days <= 1) {
    score += 10;
    reasons.push(
      days === 0
        ? 'Found on the day the item went missing'
        : 'Found one day after the item went missing',
    );
  } else if (days <= 7) {
    score += 6;
    reasons.push(`Found ${days} days after the item went missing`);
  } else {
    score += 2;
    reasons.push('Found within 30 days');
  }
  if (
    lost.brand.trim() &&
    lost.brand.toLowerCase() === found.brand.toLowerCase()
  ) {
    score += 5;
    reasons.push(`Same brand: ${found.brand}`);
  } else {
    const features = tokens(lost.identifyingFeatures);
    if ([...tokens(found.identifyingFeatures)].some((t) => features.has(t))) {
      score += 5;
      reasons.push('Private identifying details overlap; security must verify');
    }
  }
  if (score < 65 || overlap === 0) return null;
  return {
    id: `${lost.id}:${found.id}`,
    lostReportId: lost.id,
    foundReportId: found.id,
    score: Math.min(100, score),
    reasons,
  };
}
export function findMatches(reports: ItemReport[]): ItemMatch[] {
  return reports
    .filter((r) => r.type === 'lost')
    .flatMap((l) =>
      reports
        .filter((r) => r.type === 'found')
        .map((f) => scoreMatch(l, f))
        .filter((m): m is ItemMatch => m !== null),
    )
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
