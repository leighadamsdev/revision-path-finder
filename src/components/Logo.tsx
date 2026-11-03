/**
 * RevPlan wordmark: "rev" in white, "plan" in lime, set in Space Grotesk.
 * `className` sizes the text (e.g. "text-xl"); the old image logo is still in src/assets.
 */
export function Logo({ className = "text-[22px]" }: { className?: string }) {
  return (
    <span
      className={`font-[family-name:var(--font-display)] font-bold leading-none tracking-[-0.03em] text-foreground ${className}`}
      aria-label="RevPlan"
      role="img"
    >
      rev<span className="text-primary">plan</span>
    </span>
  );
}

/** Same wordmark for headers and other dark panels. */
export function LogoOnDark({ className = "text-[19px]" }: { className?: string }) {
  return <Logo className={className} />;
}
