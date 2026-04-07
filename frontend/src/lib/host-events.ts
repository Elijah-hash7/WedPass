export type StoredEvent = {
  eventId: string;
  title: string;
  date: string;
  guestLimit: number;
  checkInEnabled: boolean;
  venueName: string;
  venueLocation: string;
  timeLabel: string;
  inviteeLink: string;
  usherLink: string;
  createdAt: string;
};

const STORAGE_KEY = "wedpass.host.events";

function isBrowser() {
  return typeof window !== "undefined";
}

export function readStoredEvents(): StoredEvent[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Partial<StoredEvent>[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((event): event is Partial<StoredEvent> & Pick<StoredEvent, "eventId" | "title" | "date"> =>
        Boolean(event?.eventId && event?.title && event?.date)
      )
      .map((event) => ({
        eventId: event.eventId,
        title: event.title,
        date: event.date,
        guestLimit: event.guestLimit ?? 0,
        checkInEnabled: event.checkInEnabled ?? false,
        venueName: event.venueName ?? "",
        venueLocation: event.venueLocation ?? "",
        timeLabel: event.timeLabel ?? "",
        inviteeLink: event.inviteeLink ?? "",
        usherLink: event.usherLink ?? "",
        createdAt: event.createdAt ?? new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

export function saveStoredEvents(events: StoredEvent[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function upsertStoredEvent(nextEvent: StoredEvent) {
  const current = readStoredEvents();
  const withoutDuplicate = current.filter((event) => event.eventId !== nextEvent.eventId);
  const merged = [nextEvent, ...withoutDuplicate];
  saveStoredEvents(merged);
  return merged;
}

export function removeStoredEvent(eventId: string) {
  const nextEvents = readStoredEvents().filter((event) => event.eventId !== eventId);
  saveStoredEvents(nextEvents);
  return nextEvents;
}
