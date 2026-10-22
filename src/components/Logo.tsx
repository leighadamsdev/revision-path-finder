import logoAsset from "@/assets/revplan-logo.png.asset.json";

export function Logo({ className = "h-7 w-auto" }: { className?: string }) {
  return <img src={logoAsset.url} alt="RevPlan" className={className} />;
}

/** Logo on a white chip, for dark surfaces where the dark lettering would vanish. */
export function LogoOnDark({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-[10px] bg-white px-2 py-1">
      <img src={logoAsset.url} alt="RevPlan" className={className} />
    </span>
  );
}
