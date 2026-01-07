import { http } from "../http";

export type LocationResponse = {
  id: number;
  name: string;
  address: string;
};

export type CreateLocationRequest = {
  name: string;
  address: string;
};

export type UpdateLocationRequest = {
  name: string;
  address: string;
};

export async function getLocations() {
  const res = await http.get<LocationResponse[]>("/api/locations");
  return res.data;
}

export async function createLocation(payload: CreateLocationRequest) {
  const res = await http.post<LocationResponse>("/api/locations", payload);
  return res.data;
}

export async function updateLocation(
  id: number,
  payload: UpdateLocationRequest
) {
  const res = await http.put<LocationResponse>(`/api/locations/${id}`, payload);
  return res.data;
}

export async function deleteLocation(id: number) {
  await http.delete(`/api/locations/${id}`);
}
