'use client';
import { ArrowRight, Check, Info, ScanSearch, ShieldCheck } from 'lucide-react';
import { EmptyState, ViewHeader } from '@/components/common';
import { ItemPhoto } from '@/components/item-card';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/lib/demo-store';
import { findMatches } from '@/lib/services/matching';
import { locationName } from '@/lib/seed';
export function MatchesView({ onOpen }: { onOpen: (id: string) => void }) {
  const { state } = useDemo();
  const user = state.profiles.find((p) => p.id === state.currentUserId)!;
  const matches = findMatches(state.reports).filter(
    (m) =>
      user.role === 'security' ||
      state.reports.find((r) => r.id === m.lostReportId)?.reporterId ===
        user.id,
  );
  return (
    <>
      <ViewHeader
        eyebrow="SOME THINGS FIND THEIR WAY BACK"
        title="Possible matches"
        description="These found items share details with lost reports."
      />
      <div className="info-note">
        <Info size={19} />
        <span>
          <strong>Matching, without the mystery.</strong> Scores compare
          category, words, color, location, dates, and identifying details. They
          are a similarity score, not a probability of ownership.
        </span>
      </div>
      {matches.length ? (
        <div className="matches-list">
          {matches.map((m) => {
            const lost = state.reports.find((r) => r.id === m.lostReportId)!,
              found = state.reports.find((r) => r.id === m.foundReportId)!;
            return (
              <article className="match-card" key={m.id}>
                <div className="match-items">
                  <div>
                    <span className="eyebrow">
                      {user.role === 'security'
                        ? 'LOST REPORT'
                        : 'YOU REPORTED'}
                    </span>
                    <h3>{lost.title}</h3>
                    <p>{locationName(lost.locationId)}</p>
                    <button
                      className="text-link"
                      onClick={() => onOpen(lost.id)}
                    >
                      View lost report
                      <ArrowRight size={12} />
                    </button>
                  </div>
                  <ScanSearch size={22} />
                  <button
                    className="match-found"
                    onClick={() => onOpen(found.id)}
                  >
                    <ItemPhoto item={found} />
                    <span>
                      <span className="eyebrow">RECENTLY FOUND</span>
                      <strong>{found.title}</strong>
                      <small>{locationName(found.locationId)}</small>
                    </span>
                  </button>
                  <div className="score">
                    <strong>
                      {m.score}
                      <span>%</span>
                    </strong>
                    <small>similarity score</small>
                  </div>
                </div>
                <div className="match-reasons">
                  <div>
                    <strong>Why these items matched</strong>
                    <ul>
                      {m.reasons.map((reason) => (
                        <li key={reason}>
                          <Check size={13} />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button onClick={() => onOpen(found.id)}>
                    Take a closer look
                    <ArrowRight size={15} />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="We’re keeping an eye out"
          description="There are no active matches for your reports yet. New matches appear here when a similar found item is reported."
        />
      )}
      <div className="privacy-line">
        <ShieldCheck size={16} />
        Only campus security can verify an owner and authorize pickup.
      </div>
    </>
  );
}
