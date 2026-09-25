import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DatePicker({
  value,
  onChange,
  label = "Choose a date",
  defaultMonth,
}: {
  defaultMonth?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const selected = value ? parseISO(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-start text-left font-semibold">
          <CalendarIcon aria-hidden="true" />
          {selected ? format(selected, "EEEE d MMMM yyyy") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          {...((selected ?? defaultMonth) ? { defaultMonth: selected ?? parseISO(defaultMonth!) } : {})}
          onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
          className="pointer-events-auto p-3"
        />
      </PopoverContent>
    </Popover>
  );
}