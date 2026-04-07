import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export type EventPayload = {
  name: string;
  date: string;
  guestLimit: number;
  venue?: string;
};

export type EventResponse = {
  eventId: string;
  name: string;
  date: string;
  guestLimit: number;
  checkInEnabled: boolean;
  inviteeLink: string;
  usherLink: string;
  venue?: string;
};

export type UpdateEventPayload = Partial<{
  name: string;
  date: string;
  guestLimit: number;
  venue: string;
  checkInEnabled: boolean;
}>;

export type InviteePayload = {
  name: string;
  inviteeToken: string;
};

export type InviteeResponse = {
  inviteeId: string;
  eventId: string;
  accessCode: string;
  name: string;
  message?: string;
};

export type CheckInResponse = {
  status: "valid" | "invalid" | "already_checked";
  message: string;
  name?: string;
};

export type MetricsResponse = {
  eventId: string;
  guestLimit: number;
  totalInvitees: number;
  checkedInCount: number;
  remainingCount: number;
  availableSpots: number;
};

// ── Auth ──────────────────────────────────────────────────────────────────────

export type AuthUser = { id: string; name: string; email: string; avatar?: string; provider: string };
export type AuthResponse = { user: AuthUser; accessToken: string };

// Interceptor to add Clerk token
apiClient.interceptors.request.use(async (config) => {
  try {
    // Clerk stores the session token in __clerk_db_jwt or via the Clerk JS SDK.
    // We read it from the cookie that Clerk sets for SSR-compatible access.
    const match = document.cookie.match(/(?:^|;\s*)__session=([^;]+)/);
    if (match) {
      config.headers.Authorization = `Bearer ${match[1]}`;
    }
  } catch (e) {
    // Ignore — unauthenticated requests will simply lack the header
  }
  return config;
});

export const authRegister = async (name: string, email: string, password: string) => {
  const { data } = await apiClient.post<{ message: string }>("/auth/register", { name, email, password });
  return data;
};

export const authVerify = async (email: string, otp: string): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/verify", { email, otp });
  return data;
};

export const authLogin = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", { email, password });
  return data;
};

// ── Events ────────────────────────────────────────────────────────────────────

export const createEvent = async (payload: EventPayload): Promise<EventResponse> => {
  const { data } = await apiClient.post<EventResponse>("/events", payload);
  return data;
};

export const registerInvitee = async (payload: InviteePayload): Promise<InviteeResponse> => {
  const { data } = await apiClient.post<InviteeResponse>("/invitees", payload);
  return data;
};

export const checkAccessCode = async (
  accessCode: string,
  usherToken?: string
): Promise<CheckInResponse> => {
  const headers = usherToken ? { "x-usher-token": usherToken } : undefined;
  const { data } = await apiClient.post<CheckInResponse>("/check-in", { accessCode }, { headers });
  return data;
};

export const fetchMetrics = async (eventId: string): Promise<MetricsResponse> => {
  const { data } = await apiClient.get<MetricsResponse>(`/events/${eventId}/metrics`);
  return data;
};

export type EventDetailsResponse = {
  eventId: string;
  name: string;
  date: string;
  guestLimit: number;
  checkInEnabled: boolean;
  inviteeLink: string;
  usherLink: string;
  venue?: string;
};

export const fetchEventByToken = async (inviteeToken: string): Promise<EventDetailsResponse> => {
  const { data } = await apiClient.get<EventDetailsResponse>(`/events/by-invite-token/${inviteeToken}`);
  return data;
};

export const fetchEventByUsherToken = async (usherToken: string): Promise<EventDetailsResponse> => {
  const { data } = await apiClient.get<EventDetailsResponse>(`/events/by-usher-token/${usherToken}`);
  return data;
};

export const updateEvent = async (
  eventId: string,
  payload: UpdateEventPayload
): Promise<EventResponse> => {
  const { data } = await apiClient.patch<EventResponse>(`/events/${eventId}`, payload);
  return data;
};

export const deleteEvent = async (eventId: string): Promise<{ message: string; eventId: string }> => {
  const { data } = await apiClient.delete<{ message: string; eventId: string }>(`/events/${eventId}`);
  return data;
};

export const extractTokenFromLink = (url: string) => url.split("/").filter(Boolean).at(-1) ?? "";

export const parseApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.message || error.response?.data?.error || error.message;
    return detail;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};
