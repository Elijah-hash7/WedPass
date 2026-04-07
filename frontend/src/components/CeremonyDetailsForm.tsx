import { ChangeEvent, useState } from "react";
import { FiCalendar, FiMapPin, FiUsers } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/ui/time-picker";

export interface CeremonyDetails {
  title: string;
  date: string;
  time: string;
  venueName: string;
  venueLocation: string;
  guestLimit: number;
};

interface CeremonyDetailsFormProps {
  initialValues?: Partial<CeremonyDetails>;
  onSubmit: (details: CeremonyDetails) => void;
  submitButtonText?: string;
  isSubmitting?: boolean;
}

export default function CeremonyDetailsForm({
  initialValues = {},
  onSubmit,
  submitButtonText = "Create event & generate links",
  isSubmitting,
}: CeremonyDetailsFormProps) {
  const [title, setTitle] = useState(initialValues.title || "");
  const [date, setDate] = useState(initialValues.date || "");
  const [time, setTime] = useState(initialValues.time || "");
  const [venueName, setVenueName] = useState(initialValues.venueName || "");
  const [venueLocation, setVenueLocation] = useState(initialValues.venueLocation || "");
  const [guestLimit, setGuestLimit] = useState(
    initialValues.guestLimit ? String(initialValues.guestLimit) : ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: title.trim(),
      date,
      time,
      venueName: venueName.trim(),
      venueLocation: venueLocation.trim(),
      guestLimit: Number(guestLimit),
    });
  };

  return (
    <section id="create-event" className="card-surface p-6 sm:p-8">
      <div className="mb-8 space-y-1">
        <h3 className="text-xl font-semibold text-[var(--color-ink-strong)] tracking-tight">Event blueprint</h3>
        <p className="text-sm font-medium text-[var(--color-ink-muted)]">
          Keep it crisp. These details drive your dashboard and generated links.
        </p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Core Details */}
        <div className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
            Core Details
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Event title"
                value={title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="e.g. Adebayo & Tolu"
                required
              />
            </div>
            <Input
              label="Guest limit"
              type="number"
              min="1"
              value={guestLimit}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setGuestLimit(e.target.value)}
              placeholder="e.g. 300"
              icon={<FiUsers className="text-[var(--color-ink-muted)]" />}
              required
            />
          </div>
        </div>

        <div className="h-px w-full bg-[var(--color-line-soft)]" />

        {/* Schedule */}
        <div className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
            Schedule
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Ceremony date"
              type="date"
              value={date}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
              icon={<FiCalendar className="text-[var(--color-ink-muted)]" />}
              required
            />
            <TimePicker
              label="Start time"
              value={time}
              onChange={setTime}
              required
            />
          </div>
        </div>

        <div className="h-px w-full bg-[var(--color-line-soft)]" />

        {/* Location */}
        <div className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
            Location
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Venue name"
              value={venueName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setVenueName(e.target.value)}
              placeholder="e.g. Balmoral Hall"
              icon={<FiMapPin className="text-[var(--color-ink-muted)]" />}
            />
            <Input
              label="Venue location"
              value={venueLocation}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setVenueLocation(e.target.value)}
              placeholder="e.g. Victoria Island, Lagos"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Generating links..." : submitButtonText}
          </Button>
        </div>
      </form>
    </section>
  );
}
