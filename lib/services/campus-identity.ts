import { PROFILES } from '../seed';
import type { DemoState } from '../types';

// Correct earlier sample identities without changing user-created accounts or records.
export function migrateCampusIdentity(state: DemoState): DemoState {
  let changed = false;
  const profiles = state.profiles.map((profile) => {
    const sample = PROFILES.find((p) => p.id === profile.id);
    if (!sample) return profile;
    const localPart = sample.email.split('@')[0];
    const legacy = ['westbridge.edu.ph', 'slu.edu'].some(
      (domain) => profile.email.toLowerCase() === `${localPart}@${domain}`,
    );
    if (!legacy) return profile;
    changed = true;
    return { ...profile, email: sample.email };
  });
  return changed ? { ...state, profiles } : state;
}
