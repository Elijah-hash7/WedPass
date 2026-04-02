// Combined class merging helper
export function cn(...inputs: (string | number | undefined | null | false)[]): string {
  return inputs
    .filter((input) => typeof input === "string")
    .join(" ")
    .trim();
}

// Format date nicely: "Saturday, 12 April 2025"
export function formatWeddingDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Generate human-readable time: "10:00 AM"
export function formatWeddingTime(time: string): string {
    // Assuming time is in "HH:mm" 24h format
  const [hours, minutes] = time.split(':');
  const d = new Date();
  d.setHours(parseInt(hours, 10));
  d.setMinutes(parseInt(minutes, 10));
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}