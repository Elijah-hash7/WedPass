import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiCalendar, FiMapPin, FiClock } from "react-icons/fi";

interface CeremonyDetails {
  couple: string;
  date: string;
  venueName: string;
  venueLocation: string;
  time: string;
}

interface CeremonyDetailsFormProps {
  initialValues?: Partial<CeremonyDetails>;
  onSubmit: (details: CeremonyDetails) => void;
  submitButtonText?: string;
  isSubmitting?: boolean;
}

export default function CeremonyDetailsForm({
  initialValues = {},
  onSubmit,
  submitButtonText = "Create Event & Generate Links",
  isSubmitting,
}: CeremonyDetailsFormProps) {
  const [couple, setCouple] = useState(initialValues.couple || "");
  const [date, setDate] = useState(initialValues.date || "");
  const [venueName, setVenueName] = useState(initialValues.venueName || "");
  const [venueLocation, setVenueLocation] = useState(initialValues.venueLocation || "");
  const [time, setTime] = useState(initialValues.time || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ couple, date, venueName, venueLocation, time });
  };

  return (
    <section className="card-surface p-6 sm:p-8 bg-white/80">
      <div className="mb-6 space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-muted)]">
          Ceremony Details
        </p>
        <h3 className="font-serif text-2xl text-[var(--color-ink-strong)]">Event blueprint</h3>
        <p className="text-sm text-[var(--color-ink-muted)]">
          Keep it crisp—these details power the links and your invitation tone.
        </p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          label="Celebrated couple"
          value={couple}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setCouple(e.target.value)}
          placeholder="e.g. Adebayo & Tolu"
          description="Use “&” or “and” for elegance."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Ceremony date"
            type="date"
            value={date}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
            icon={<FiCalendar className="text-[var(--color-ink-muted)]" />}
          />
          <Input
            label="Start time"
            type="time"
            value={time}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTime(e.target.value)}
            icon={<FiClock className="text-[var(--color-ink-muted)]" />}
          />
        </div>
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
        <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitButtonText}
        </Button>
      </form>
    </section>
  );
}
