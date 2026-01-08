// src/api/models/sessions.ts

import { http } from "../http";

export type SessionStatus = "SCHEDULED" | "CANCELLED";

export type SessionResponse = {
  id: number;
  startsAt: string;
  endsAt: string;

  capacity: number;
  status: string;

  locationId: number;
  locationName: string;

  fitnessServiceId: number;
  fitnessServiceName: string;

  trainerEmployeeId: number;
  trainerName: string;
};

export type CreateSessionRequest = {
  startsAt: string;
  endsAt: string;
  capacity: number;
  locationId: number;
  fitnessServiceId: number;
  trainerEmployeeId: number;
};

export type UpdateSessionRequest = {
  startsAt: string;
  endsAt: string;
  capacity: number;
  status: SessionStatus;
  locationId: number;
  fitnessServiceId: number;
  trainerEmployeeId: number;
};

export async function getSessions(): Promise<SessionResponse[]> {
  const res = await http.get("/api/sessions");
  return res.data;
}

export async function createSession(
  payload: CreateSessionRequest
): Promise<SessionResponse> {
  const res = await http.post("/api/sessions", payload);
  return res.data;
}

export async function updateSession(
  id: number,
  payload: UpdateSessionRequest
): Promise<SessionResponse> {
  const res = await http.put(`/api/sessions/${id}`, payload);
  return res.data;
}

export async function deleteSession(id: number): Promise<void> {
  await http.delete(`/api/sessions/${id}`);
}
