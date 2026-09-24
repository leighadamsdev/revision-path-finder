import { useEffect, useMemo, useState } from "react";

type School = { id: string; name: string };

const field =
  "mt-1 w-full rounded-[12px] bg-background px-3 py-2.5 text-sm font-medium ring-1 ring-border focus:outline-none focus:ring-ring";

/** Type-ahead school picker: type a few letters, pick from matches. */
export function SchoolSearch({
  schools,
  value,
  onChange,
  placeholder = "Start typing your school name…",
}: {
  schools: School[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}) {
  const selected = schools.find((s) => s.id === value);
  const [text, setText] = useState(selected?.name ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (selected) setText(selected.name);
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const matches = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (q.length < 2) return [];
    const starts = schools.filter((s) => s.name.toLowerCase().startsWith(q));
    const contains = schools.filter(
      (s) => !s.name.toLowerCase().startsWith(q) && s.name.toLowerCase().includes(q),
    );
    return [...starts, ...contains].slice(0, 8);
  }, [text, schools]);

  return (
    <div className="relative">
      <input
        type="text"
        value={text}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
          if (value) onChange("");
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={field}
      />
      {open && matches.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-[12px] bg-card py-1 shadow-lg ring-1 ring-border">
          {matches.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(s.id);
                  setText(s.name);
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm font-medium hover:bg-muted"
              >
                {s.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {open && text.trim().length >= 2 && matches.length === 0 ? (
        <p className="mt-1 text-[11px] font-medium text-muted-foreground">No schools match that yet.</p>
      ) : null}
    </div>
  );
}
