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
        title="Help & how it works"
        description="Everything you need to report, claim, or return an item."
      />
      <div className="help-steps">
        {[
          {
            n: '01',
            icon: FileSearch,
            title: '1. Report your item',
            text: 'Report the item with a clear description, a photo if you have one, and where you last saw it. Add unique marks to the private details field.',
          },
          {
            n: '02',
            icon: ShieldCheck,
            title: '2. Check items & claim',
            text: 'Browse found items or follow a possible match. Submit private details and proof when something looks like yours. Security reviews every claim.',
          },
          {
            n: '03',
            icon: CheckCircle2,
            title: '3. Verify & collect',
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
              We compare the item’s category, description, color, location,
              date, and identifying details. A higher percentage means the
              reports have more in common. It does not prove ownership: security
              still needs to review your claim. This demo does not use AI or
              recognize objects in photos.
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
          <h2>Before you collect an item</h2>
          <p>Wait for approval and read the security review note.</p>
          <div>
            <MapPin size={17} />
            <span>Check the pickup instructions in your claim</span>
          </div>
          <div>
            <Clock3 size={17} />
            <span>Confirm the pickup location and time first</span>
          </div>
          <small>
            Unofficial prototype. Locations and security workflows are sample
            data, not SLU service instructions.
          </small>
          <Button onClick={onReport}>
            Report an item
            <ArrowRight size={15} />
          </Button>
          <Button variant="outline" onClick={onBrowse}>
            Browse items
          </Button>
        </aside>
      </div>
      <div className="install-panel">
        <div>
          <h3>Add LouFind to your home screen</h3>
          <p>Open the app quickly when you need it.</p>
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
