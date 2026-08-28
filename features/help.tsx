'use client';
import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  FileSearch,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewHeader } from '@/components/common';
export function HelpView({
  onReport,
  onBrowse,
  onInstall,
  installAvailable,
}: {
  onReport: () => void;
  onBrowse: () => void;
  onInstall: () => void;
  installAvailable: boolean;
}) {
  const [installInfo, setInstallInfo] = useState(false);
  return (
    <>
      <ViewHeader
        title="A little guidance."
        description="Everything you need to report, claim, or return an item."
      />
      <div className="help-steps">
        {[
          {
            n: '01',
            icon: FileSearch,
            title: 'Tell us what’s missing.',
            text: 'Report the item with a clear description, a photo if you have one, and where you last saw it. Add unique marks to the private details field.',
          },
          {
            n: '02',
            icon: ShieldCheck,
            title: 'A match is a starting point.',
            text: 'Browse found items or follow a possible match. Submit private details and proof when something looks like yours. Security reviews every claim.',
          },
          {
            n: '03',
            icon: CheckCircle2,
            title: 'Bring it back home.',
            text: 'Once your claim is approved, bring your school ID to campus security. The officer checks your ID, hands over the item, and records the return.',
          },
        ].map((s) => (
          <article key={s.n}>
            <span className="eyebrow">STEP {s.n}</span>
            <s.icon size={29} strokeWidth={1.3} />
            <h2>{s.title}</h2>
            <p>{s.text}</p>
          </article>
        ))}
      </div>
      <div className="help-content">
        <section>
          <h2>Good to know</h2>
          <details>
            <summary>What should I do with a found item?</summary>
            <p>
              Submit a found report, then hand the item to campus security.
              Avoid sharing names or ID numbers in the public description or
              photo. The security team records the exact storage location
              privately.
            </p>
          </details>
          <details>
            <summary>How do possible matches work?</summary>
            <p>
              The deterministic score uses category (30 points), text similarity
              (25), color (15), location (15), date (10), and brand or private
              feature overlap (5). The result is a similarity score, not a
              guarantee. No image recognition or AI is used.
            </p>
          </details>
          <details>
            <summary>What information stays private?</summary>
            <p>
              Your email, school ID, contact preference, ownership proof,
              identifying marks, and storage location are excluded from public
              item screens. This local prototype keeps its data in your browser,
              so it is not a secure place for real identity documents.
            </p>
          </details>
          <details>
            <summary>Will my reports be saved?</summary>
            <p>
              Yes, in this browser on this device. Drafts save as you type.
              Clearing browser storage or resetting the demo removes those
              records. This prototype does not send email, connect to a real
              school, or sync across devices.
            </p>
          </details>
          <details>
            <summary>What should I bring for pickup?</summary>
            <p>
              Wait until the claim says Ready for Pickup, then bring your school
              ID and any evidence requested in the security review note. A claim
              approval does not replace the final identity check at pickup.
            </p>
          </details>
        </section>
        <aside className="help-office">
          <ShieldCheck size={30} strokeWidth={1.4} />
          <h2>Campus Security Office</h2>
          <p>For handovers, verified pickups, and a helping hand.</p>
          <div>
            <MapPin size={17} />
            <span>Main Entrance, Ground Floor</span>
          </div>
          <div>
            <Clock3 size={17} />
            <span>
              Monday–Friday
              <br />
              8:00 AM–5:00 PM
            </span>
          </div>
          <small>Sample campus details for this prototype.</small>
          <Button onClick={onReport}>
            Report an item
            <ArrowRight size={15} />
          </Button>
          <Button variant="outline" onClick={onBrowse}>
            Browse the noticeboard
          </Button>
        </aside>
      </div>
      <div className="install-panel">
        <div>
          <h3>A place on your home screen.</h3>
          <p>Keep FindIt Campus close by for the next familiar find.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            if (installAvailable) onInstall();
            else setInstallInfo(!installInfo);
          }}
        >
          <Download size={16} />
          Install app
        </Button>
      </div>
      {installInfo && (
        <div className="info-note">
          <Download size={18} />
          <span>
            On iPhone: open this app in Safari, tap Share, then Add to Home
            Screen. On desktop or Android: use your browser’s Install app
            option. Installation requires HTTPS or localhost and a supported
            browser.
          </span>
        </div>
      )}
    </>
  );
}
