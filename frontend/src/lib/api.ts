import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export type EventPayload = {
  couple: string;
  date: string;
  venueName: string;
  venueLocation: string;
  time: string;
};

export type EventResponse = {
  id: string;
  inviteLink?: string;
  usherLink?: string;
};

export type InviteePayload = {
  name: string;
  eventId: string;
};

export type InviteeResponse = {
  accessCode: string;
  name: string;
  message?: string;
};

export type CheckInResponse = {
  status: "valid" | "invalid" | "already_checked";
  message: string;
  name?: string;
};

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

export const fetchMetrics = async (eventId: string) => {
  const { data } = await apiClient.get(`/metrics/${eventId}`);
  return data as Record<string, number>;
};

export const buildInviteLink = (origin: string, eventId: string) =>
  `${origin.replace(/\/$/, "")}/invite?eventId=${eventId}`;

export const buildUsherLink = (origin: string, eventId: string) =>
  `${origin.replace(/\/$/, "")}/usher?eventId=${eventId}`;

export const parseApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const detail =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;
    return detail;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};
