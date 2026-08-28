/* oxlint-disable next/no-img-element -- Local optimized artwork supplied by the user. */
export function LouFindLogo({ full = false }: { full?: boolean }) {
  if (full) {
    return (
      <img
        className="loufind-logo-full"
        src="/brand/loufind-logo.webp"
        alt="LouFind — SLU Lost & Found"
        width={1330}
        height={1182}
        fetchPriority="high"
      />
    );
  }
  return (
    <span className="loufind-symbol" aria-hidden="true">
      <img src="/brand/loufind-logo.webp" alt="" width={1330} height={1182} />
    </span>
  );
}
