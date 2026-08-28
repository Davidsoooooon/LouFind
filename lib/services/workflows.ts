import { findMatches } from './matching';
import { claimSchema, reportSchema } from '../schemas';
import type {
  DemoState,
  ItemReport,
  OwnershipClaim,
  ReportStatus,
} from '../types';
export function requireUser(state: DemoState) {
  const user = state.profiles.find((p) => p.id === state.currentUserId);
  if (!user) throw new Error('Please sign in first.');
  return user;
}
const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();
function log(state: DemoState, message: string) {
  state.logs.unshift({
    id: uid(),
    actorId: state.currentUserId!,
    message,
    createdAt: now(),
  });
}
export function saveReport(
  state: DemoState,
  report: ItemReport,
  draft: boolean,
): DemoState {
  if (!draft) reportSchema.parse(report);
  const user = requireUser(state),
    existing = state.reports.find((r) => r.id === report.id);
  if (
    report.reporterId !== user.id ||
    (existing && existing.reporterId !== user.id)
  )
    throw new Error('You can only edit your own reports.');
  if (
    existing &&
    ['Under Review', 'Ready for Pickup', 'Returned', 'Unclaimed'].includes(
      existing.status,
    )
  )
    throw new Error('This report is being managed by campus security.');
  const next = structuredClone(state);
  const saved = {
    ...report,
    status: (draft ? 'Draft' : 'Reported') as ReportStatus,
    updatedAt: now(),
  };
  const index = next.reports.findIndex((r) => r.id === report.id);
  if (index < 0) next.reports.unshift(saved);
  else next.reports[index] = saved;
  if (!draft) {
    log(
      next,
      `${report.type === 'lost' ? 'Lost' : 'Found'} report submitted: ${report.title}.`,
    );
    for (const match of findMatches(next.reports).filter(
      (m) => m.lostReportId === saved.id || m.foundReportId === saved.id,
    )) {
      const lost = next.reports.find((r) => r.id === match.lostReportId)!,
        found = next.reports.find((r) => r.id === match.foundReportId)!;
      if (lost.status === 'Reported') lost.status = 'Possible Match';
      if (found.status === 'Reported') found.status = 'Possible Match';
      if (!next.notifications.some((n) => n.id === `match-${match.id}`))
        next.notifications.unshift({
          id: `match-${match.id}`,
          userId: lost.reporterId,
          type: 'match',
          title: `A possible match for ${lost.title}`,
          message: `${found.title} scored ${match.score}% based on report details. Review it before making a claim.`,
          reportId: found.id,
          read: false,
          createdAt: now(),
        });
    }
  }
  return next;
}
export function submitClaim(
  state: DemoState,
  claim: OwnershipClaim,
): DemoState {
  claimSchema.parse(claim);
  const user = requireUser(state),
    report = state.reports.find((r) => r.id === claim.reportId);
  if (claim.claimantId !== user.id)
    throw new Error('You can only submit your own claim.');
  if (
    claim.lostReportId &&
    !state.reports.some(
      (r) =>
        r.id === claim.lostReportId &&
        r.reporterId === user.id &&
        r.type === 'lost' &&
        !['Draft', 'Returned', 'Unclaimed'].includes(r.status),
    )
  )
    throw new Error('Link only one of your own active lost reports.');
  if (
    !report ||
    report.type !== 'found' ||
    report.reporterId === user.id ||
    ['Draft', 'Returned', 'Ready for Pickup', 'Unclaimed'].includes(
      report.status,
    )
  )
    throw new Error('This item is not available for a claim.');
  if (
    state.claims.some(
      (c) =>
        c.reportId === report.id &&
        c.claimantId === user.id &&
        c.status !== 'Rejected',
    )
  )
    throw new Error('You already have an active claim for this item.');
  const next = structuredClone(state);
  next.claims.unshift({ ...claim, status: 'Under Review' });
  next.reports.find((r) => r.id === report.id)!.status = 'Under Review';
  next.reports.find((r) => r.id === report.id)!.updatedAt = now();
  next.notifications.unshift({
    id: uid(),
    userId: user.id,
    type: 'claim',
    title: 'Your claim is with campus security',
    message: `Your claim for ${report.title} was submitted. A match score alone never approves ownership.`,
    reportId: report.id,
    read: false,
    createdAt: now(),
  });
  log(next, `Ownership claim submitted for ${report.title}.`);
  return next;
}
export function reviewClaim(
  state: DemoState,
  id: string,
  approve: boolean,
  note: string,
): DemoState {
  if (requireUser(state).role !== 'security')
    throw new Error('Only campus security can review claims.');
  const claim = state.claims.find((c) => c.id === id);
  if (!claim || claim.status !== 'Under Review')
    throw new Error('This claim has already been reviewed.');
  if (note.trim().length < 10)
    throw new Error('Add a review note of at least 10 characters.');
  if (
    approve &&
    state.claims.some(
      (c) =>
        c.reportId === claim.reportId &&
        ['Ready for Pickup', 'Returned'].includes(c.status),
    )
  )
    throw new Error('An owner has already been verified for this item.');
  const next = structuredClone(state),
    target = next.claims.find((c) => c.id === id)!,
    report = next.reports.find((r) => r.id === target.reportId)!;
  target.status = approve ? 'Ready for Pickup' : 'Rejected';
  target.reviewNote = note.trim();
  target.reviewedAt = now();
  report.status =
    approve ||
    next.claims.some(
      (c) => c.reportId === report.id && c.status === 'Ready for Pickup',
    )
      ? 'Ready for Pickup'
      : next.claims.some(
            (c) => c.reportId === report.id && c.status === 'Under Review',
          )
        ? 'Under Review'
        : 'Reported';
  report.updatedAt = now();
  next.notifications.unshift({
    id: uid(),
    userId: target.claimantId,
    type: approve ? 'pickup' : 'claim',
    title: approve
      ? 'Claim approved — ready for pickup'
      : 'Claim reviewed — more evidence needed',
    message: approve
      ? `${report.title} is ready at the Security Office. Bring a school ID. ${note.trim()}`
      : `${report.title}: ${note.trim()}`,
    reportId: report.id,
    read: false,
    createdAt: now(),
  });
  log(
    next,
    `${approve ? 'Approved' : 'Rejected'} ownership claim for ${report.title}.`,
  );
  return next;
}
export function manageReport(
  state: DemoState,
  id: string,
  status: ReportStatus,
  storage: string,
): DemoState {
  if (requireUser(state).role !== 'security')
    throw new Error('Only campus security can manage stored items.');
  const report = state.reports.find((r) => r.id === id);
  if (!report || report.status === 'Draft')
    throw new Error('This report is not available.');
  if (
    ['Draft', 'Rejected'].includes(status) ||
    (status === 'Ready for Pickup' && report.status !== 'Ready for Pickup')
  )
    throw new Error('Use claim review to verify ownership before pickup.');
  if (report.status === 'Returned' && status !== 'Returned')
    throw new Error('A completed return cannot be reopened.');
  const approved = state.claims.find(
    (c) => c.reportId === id && c.status === 'Ready for Pickup',
  );
  if (status === 'Returned' && report.status !== 'Returned' && !approved)
    throw new Error('Approve an ownership claim before recording the return.');
  if (
    status === 'Unclaimed' &&
    state.claims.some((c) => c.reportId === id && c.status === 'Under Review')
  )
    throw new Error('Review pending claims before marking an item unclaimed.');
  if (
    report.status === 'Ready for Pickup' &&
    status !== 'Ready for Pickup' &&
    status !== 'Returned'
  )
    throw new Error(
      'This item has a verified owner. Complete the pickup first.',
    );
  const next = structuredClone(state),
    target = next.reports.find((r) => r.id === id)!;
  target.status = status;
  target.storageLocation = storage.trim();
  target.updatedAt = now();
  if (status === 'Returned' && approved) {
    next.claims.find((c) => c.id === approved.id)!.status = 'Returned';
    const linked = next.reports.find(
      (r) =>
        r.id === approved.lostReportId &&
        r.reporterId === approved.claimantId &&
        r.type === 'lost',
    );
    if (linked) {
      linked.status = 'Returned';
      linked.updatedAt = now();
    }
    for (const other of next.claims.filter(
      (c) => c.reportId === id && c.status === 'Under Review',
    )) {
      other.status = 'Rejected';
      other.reviewNote = 'Item returned to another verified owner.';
      next.notifications.unshift({
        id: uid(),
        userId: other.claimantId,
        type: 'claim',
        title: 'Claim closed',
        message: `${report.title} was returned to another verified owner.`,
        reportId: id,
        read: false,
        createdAt: now(),
      });
    }
    for (const userId of new Set([approved.claimantId, report.reporterId]))
      next.notifications.unshift({
        id: uid(),
        userId,
        type: 'returned',
        title: 'One less thing lost',
        message: `${report.title} has been safely returned to its verified owner.`,
        reportId: id,
        read: false,
        createdAt: now(),
      });
  }
  log(
    next,
    `${report.title}: ${status.toLowerCase()}; storage record updated.`,
  );
  return next;
}
