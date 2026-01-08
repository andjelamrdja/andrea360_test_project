import { http } from "../http";

export type FitnessServiceResponse = {
  id: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  active: boolean;
  locationId?: number;
  locationName?: string;
};

export type CreateFitnessServiceRequest = {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  active?: boolean;
  locationId?: number;
};

export type UpdateFitnessServiceRequest = {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  active: boolean;
  locationId?: number;
};

export async function getFitnessServices(): Promise<FitnessServiceResponse[]> {
  const res = await http.get("/api/fitness-services");
  return res.data;
}

export async function getFitnessServiceById(
  id: number
): Promise<FitnessServiceResponse> {
  const res = await http.get(`/api/fitness-services/${id}`);
  return res.data;
}

export async function getActiveFitnessServices() {
  const res = await http.get("/api/fitness-services/active");
  return res.data;
}

export async function createFitnessService(
  payload: CreateFitnessServiceRequest
): Promise<FitnessServiceResponse> {
  console.log("CREATE SERVICE payload:", payload);

  const res = await http.post("/api/fitness-services", payload);
  return res.data;
}

export async function updateFitnessService(
  id: number,
  payload: UpdateFitnessServiceRequest
): Promise<FitnessServiceResponse> {
  const res = await http.put(`/api/fitness-services/${id}`, payload);
  return res.data;
}

export async function deleteFitnessService(id: number): Promise<void> {
  await http.delete(`/api/fitness-services/${id}`);
}
