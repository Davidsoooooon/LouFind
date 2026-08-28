import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../lib/seed';
import { findMatches, scoreMatch } from '../lib/services/matching';
import {
  manageReport,
  reviewClaim,
  saveReport,
  submitClaim,
} from '../lib/services/workflows';
import { claimSchema, reportSchema, registrationSchema } from '../lib/schemas';
import type { OwnershipClaim } from '../lib/types';
const claim: OwnershipClaim = {
  id: 'test-claim',
  reportId: '104',
  claimantId: 'jamie',
  details: 'JS initials inside the cover',
  contents: 'A scratch near the solar panel',
  proof: 'I can show the purchase receipt.',
  imageUrl: '',
  status: 'Under Review',
  createdAt: '2026-08-28T03:00:00Z',
  reviewNote: '',
};
void test('matching is deterministic, bounded, and contains expected calculator and keys pairs', () => {
  const s = createSeed();
  const matches = findMatches(s.reports);
  assert.deepEqual(matches, findMatches(s.reports));
  assert(
    matches.some((m) => m.lostReportId === '201' && m.foundReportId === '104'),
  );
  assert(
    matches.some((m) => m.lostReportId === '202' && m.foundReportId === '105'),
  );
  assert(
    matches.every(
      (m) => m.score >= 65 && m.score <= 100 && m.reasons.length > 2,
    ),
  );
});
void test('matching excludes invalid direction, own reports, earlier dates, and terminal states', () => {
  const s = createSeed(),
    lost = s.reports.find((r) => r.id === '201')!,
    found = s.reports.find((r) => r.id === '104')!;
  assert.equal(scoreMatch(found, lost), null);
  assert.equal(
    scoreMatch(lost, { ...found, reporterId: lost.reporterId }),
    null,
  );
  assert.equal(scoreMatch(lost, { ...found, date: '2026-08-20' }), null);
  for (const status of [
    'Draft',
    'Returned',
    'Unclaimed',
    'Ready for Pickup',
  ] as const)
    assert.equal(scoreMatch(lost, { ...found, status }), null);
});
void test('matching handles nearby zones, color families, and hides private evidence', () => {
  const s = createSeed(),
    lost = s.reports.find((r) => r.id === '201')!,
    found = s.reports.find((r) => r.id === '104')!;
  const match = scoreMatch(
    { ...lost, color: 'Navy' },
    { ...found, color: 'Blue', locationId: 'classroom' },
  );
  assert(match?.reasons.includes('Found nearby, in the same campus zone'));
  assert(match?.reasons.some((r) => r.includes('Same or similar color')));
  assert(!JSON.stringify(match?.reasons).includes('JS written'));
});
void test('draft reports are not matched; users cannot edit someone else’s report', () => {
  const s = createSeed(),
    report = { ...s.reports.find((r) => r.id === '201')!, id: 'new-draft' };
  const saved = saveReport(s, report, true);
  assert.equal(
    saved.reports.find((r) => r.id === 'new-draft')?.status,
    'Draft',
  );
  assert(
    !findMatches(saved.reports).some((m) => m.lostReportId === 'new-draft'),
  );
  assert.throws(
    () => saveReport(s, { ...report, reporterId: 'mika' }, true),
    /own/,
  );
  assert.equal(s.reports.length, 12);
});
void test('new reports generate matching notifications without duplicates', () => {
  const s = createSeed(),
    report = { ...s.reports.find((r) => r.id === '201')!, id: 'new-report' };
  const saved = saveReport(s, report, false);
  assert.equal(
    saved.reports.find((r) => r.id === 'new-report')?.status,
    'Possible Match',
  );
  const again = saveReport(saved, report, false);
  assert.equal(again.notifications.length, saved.notifications.length);
  assert(saved.notifications.some((n) => n.id === 'match-new-report:104'));
});
void test('a claim is private, requires review, and cannot be duplicated or spoofed', () => {
  const s = createSeed();
  const next = submitClaim(s, claim);
  assert.equal(next.claims[0].status, 'Under Review');
  assert.equal(
    next.reports.find((r) => r.id === '104')?.status,
    'Under Review',
  );
  assert.throws(() => submitClaim(next, claim), /active claim/);
  assert.throws(
    () => submitClaim(s, { ...claim, claimantId: 'mika' }),
    /own claim/,
  );
  assert.throws(
    () => submitClaim(s, { ...claim, reportId: '201' }),
    /available/,
  );
  assert.equal(s.claims.length, 2);
});
void test('student cannot approve claims or update storage', () => {
  const s = submitClaim(createSeed(), claim);
  assert.throws(
    () => reviewClaim(s, claim.id, true, 'Evidence verified'),
    /Only campus security/,
  );
  assert.throws(
    () => manageReport(s, '104', 'Returned', 'Cabinet B'),
    /Only campus security/,
  );
});
void test('security approval and physical return notify claimant and reporter', () => {
  let s = submitClaim(createSeed(), claim);
  s.currentUserId = 'security';
  assert.throws(
    () => manageReport(s, '104', 'Returned', 'Cabinet B'),
    /Approve an ownership claim/,
  );
  s = reviewClaim(
    s,
    claim.id,
    true,
    'Initials and receipt verified. Bring school ID.',
  );
  assert.equal(s.claims[0].status, 'Ready for Pickup');
  assert(
    s.notifications.some((n) => n.userId === 'jamie' && n.type === 'pickup'),
  );
  s = manageReport(s, '104', 'Returned', 'Security Office · Cabinet B');
  assert.equal(s.reports.find((r) => r.id === '104')?.status, 'Returned');
  assert.equal(s.claims[0].status, 'Returned');
  assert(
    s.notifications.some((n) => n.userId === 'jamie' && n.type === 'returned'),
  );
  assert(
    s.notifications.some((n) => n.userId === 'mika' && n.type === 'returned'),
  );
  assert.throws(
    () => manageReport(s, '104', 'Reported', ''),
    /cannot be reopened/,
  );
});
void test('security cannot approve twice and must explain rejection', () => {
  let s = createSeed();
  s.currentUserId = 'security';
  assert.throws(() => reviewClaim(s, 'claim-1', false, 'No'), /review note/);
  s = reviewClaim(s, 'claim-1', false, 'The supplied details do not match.');
  assert.equal(s.claims.find((c) => c.id === 'claim-1')?.status, 'Rejected');
  assert.equal(s.reports.find((r) => r.id === '103')?.status, 'Reported');
  assert.throws(
    () => reviewClaim(s, 'claim-1', true, 'Now approved with evidence'),
    /already been reviewed/,
  );
});
void test('report validation rejects incomplete and future dated reports', () => {
  const r = createSeed().reports[0];
  assert(reportSchema.safeParse(r).success);
  assert(
    !reportSchema.safeParse({ ...r, title: 'a', locationId: 'none' }).success,
  );
  assert(!reportSchema.safeParse({ ...r, date: '2099-01-01' }).success);
  assert(
    !claimSchema.safeParse({
      details: 'mine',
      proof: 'yes',
      contents: '',
      imageUrl: '',
    }).success,
  );
});
void test('registration requires school email and cannot assign security role', () => {
  const v = {
    name: 'Test Student',
    schoolId: '2026-0011',
    email: 'test@westbridge.edu.ph',
    password: 'SampleOnly123!',
    role: 'student',
  };
  assert(registrationSchema.safeParse(v).success);
  assert(
    !registrationSchema.safeParse({ ...v, email: 'test@example.com' }).success,
  );
  assert(!registrationSchema.safeParse({ ...v, role: 'security' }).success);
});
void test('rejecting a competing claim preserves the verified owner and storage changes are logged', () => {
  let s = submitClaim(createSeed(), claim);
  s.currentUserId = 'staff';
  s = submitClaim(s, { ...claim, id: 'competing', claimantId: 'staff' });
  s.currentUserId = 'security';
  s = reviewClaim(
    s,
    claim.id,
    true,
    'Evidence verified for the original owner.',
  );
  s = reviewClaim(s, 'competing', false, 'The private marks do not match.');
  assert.equal(
    s.reports.find((r) => r.id === '104')?.status,
    'Ready for Pickup',
  );
  s = manageReport(s, '104', 'Ready for Pickup', 'Cabinet C');
  assert.equal(
    s.reports.find((r) => r.id === '104')?.storageLocation,
    'Cabinet C',
  );
  assert(s.logs[0].message.includes('storage record updated'));
});
void test('pending claims prevent premature unclaimed status and invalid dates are rejected', () => {
  const s = createSeed();
  s.currentUserId = 'security';
  assert.throws(
    () => manageReport(s, '103', 'Unclaimed', 'A'),
    /Review pending claims/,
  );
  assert(
    !reportSchema.safeParse({ ...s.reports[0], date: '2026-02-30' }).success,
  );
  assert(!reportSchema.safeParse({ ...s.reports[0], time: '99:90' }).success);
});
void test('only an explicitly linked owned lost report closes after a verified return', () => {
  const original = createSeed();
  assert.throws(
    () => submitClaim(original, { ...claim, lostReportId: '204' }),
    /your own active/,
  );
  let s = submitClaim(original, { ...claim, lostReportId: '201' });
  s.currentUserId = 'security';
  s = reviewClaim(s, claim.id, true, 'Evidence and linked report checked.');
  assert.equal(s.reports.find((r) => r.id === '201')?.status, 'Possible Match');
  s = manageReport(s, '104', 'Returned', 'Cabinet B');
  assert.equal(s.reports.find((r) => r.id === '201')?.status, 'Returned');
  assert.equal(s.reports.find((r) => r.id === '202')?.status, 'Possible Match');
});
