import type { ReactNode } from "react";
import { Check } from "lucide-react";

import type { Choice } from "@/lib/tutor-prompt";

/** Form building blocks shared by the AI tutor and practice questions builders. */
export const select =
  "mt-1 h-10 w-full rounded-[10px] bg-background px-3 text-[13px] font-semibold ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-ring";

export function Section({
  n,
  title,
  hint,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-[16px] bg-card p-4 ring-1 ring-black/5 sm:p-5">
      <div>
        <p className="flex items-center gap-2 text-sm font-extrabold">
          <span className="grid size-6 place-items-center rounded-[6px] bg-primary text-[12px] text-primary-foreground">
            {n}
          </span>
          {title}
        </p>
        {hint ? <p className="mt-1 text-[12px] font-medium text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-2 first:mt-0">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function QuickButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-background px-3 py-1.5 text-[12px] font-bold ring-1 ring-border hover:bg-secondary"
    >
      {children}
    </button>
  );
}

export function ChoiceGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Choice[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </legend>
      <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex cursor-pointer items-start gap-2 rounded-[10px] p-2.5 text-[13px] ring-1 ${
              value === o.value ? "bg-secondary ring-2 ring-primary" : "bg-background ring-border"
            }`}
          >
            <input
              type="radio"
              name={label}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="mt-0.5 accent-primary"
            />
            <span>
              <span className="block font-extrabold">{o.label}</span>
              <span className="block text-[12px] font-medium text-muted-foreground">
                {o.prompt}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function MultiGroup({
  label,
  options,
  values,
  onToggle,
}: {
  label: string;
  options: Choice[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <fieldset>
      {label ? (
        <legend className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </legend>
      ) : null}
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = values.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(o.value)}
              title={o.prompt}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold ${
                on
                  ? "bg-structure text-structure-foreground"
                  : "bg-background text-muted-foreground ring-1 ring-border"
              }`}
            >
              {on ? <Check className="size-3" strokeWidth={3} /> : null}
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
