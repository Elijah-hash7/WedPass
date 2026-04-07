import * as React from "react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  label?: string;
  value: string;
  onChange: (time: string) => void;
  required?: boolean;
  className?: string;
}

export function TimePicker({ label, value, onChange, required, className }: TimePickerProps) {
  const parsed = parseTime(value);
  const [hour, setHour] = React.useState(parsed.hour);
  const [minute, setMinute] = React.useState(parsed.minute);
  const [period, setPeriod] = React.useState(parsed.period);

  React.useEffect(() => {
    const p = parseTime(value);
    setHour(p.hour);
    setMinute(p.minute);
    setPeriod(p.period);
  }, [value]);

  const emit = (h: string, m: string, p: string) => {
    if (!h || !m) return;
    let h24 = parseInt(h, 10);
    if (p === "PM" && h24 !== 12) h24 += 12;
    if (p === "AM" && h24 === 12) h24 = 0;
    onChange(`${String(h24).padStart(2, "0")}:${m}`);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-[var(--color-ink-soft)] tracking-wide">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <select
          value={hour}
          onChange={(e) => { setHour(e.target.value); emit(e.target.value, minute, period); }}
          required={required}
          className="flex h-12 w-[72px] rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-ivory)] px-3 text-[15px] font-medium text-[var(--color-ink-strong)] shadow-[0_2px_4px_rgba(0,0,0,0.02)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--color-ink-strong)]/15 transition-all appearance-none cursor-pointer"
        >
          <option value="" disabled>HH</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={String(h)}>{String(h).padStart(2, "0")}</option>
          ))}
        </select>

        <span className="text-lg font-semibold text-[var(--color-ink-muted)]">:</span>

        <select
          value={minute}
          onChange={(e) => { setMinute(e.target.value); emit(hour, e.target.value, period); }}
          required={required}
          className="flex h-12 w-[72px] rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-ivory)]/90 px-3 text-sm text-[var(--color-ink-strong)] shadow-[0_10px_35px_-28px_rgba(15,35,25,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(139,58,98,0.2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-ivory)] transition-all appearance-none cursor-pointer"
        >
          <option value="" disabled>MM</option>
          {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <div className="flex rounded-xl border border-[var(--color-line-strong)] overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <button
            type="button"
            onClick={() => { setPeriod("AM"); emit(hour, minute, "AM"); }}
            className={cn(
              "h-12 px-4 text-[15px] font-bold transition-all",
              period === "AM"
                ? "bg-[var(--color-ink-strong)] text-[var(--color-ivory)]"
                : "bg-[var(--color-ivory)] text-[var(--color-ink-muted)] hover:bg-[var(--color-shell)] hover:text-[var(--color-ink-strong)]"
            )}
          >
            AM
          </button>
          <div className="w-[1px] bg-[var(--color-line-soft)]" />
          <button
            type="button"
            onClick={() => { setPeriod("PM"); emit(hour, minute, "PM"); }}
            className={cn(
              "h-12 px-4 text-[15px] font-bold transition-all",
              period === "PM"
                ? "bg-[var(--color-ink-strong)] text-[var(--color-ivory)]"
                : "bg-[var(--color-ivory)] text-[var(--color-ink-muted)] hover:bg-[var(--color-shell)] hover:text-[var(--color-ink-strong)]"
            )}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
}

function parseTime(value: string) {
  if (!value) return { hour: "", minute: "", period: "AM" };
  const [hStr, mStr] = value.split(":");
  let h = parseInt(hStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  if (h > 12) h -= 12;
  return { hour: String(h), minute: mStr || "00", period };
}
