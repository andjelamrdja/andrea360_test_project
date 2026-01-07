import { http } from "../http";

export type EmployeeAuthRole = "ADMIN" | "EMPLOYEE";

export type EmployeeResponse = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  locationId: number;
  locationName: string;
};

export type CreateEmployeeRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string;
  authRole?: EmployeeAuthRole;
  locationId: number;
};

export type UpdateEmployeeRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  locationId: number;
};

export async function getEmployees() {
  const res = await http.get<EmployeeResponse[]>("/api/employees");
  return res.data;
}

export async function createEmployee(payload: CreateEmployeeRequest) {
  const res = await http.post<EmployeeResponse>("/api/employees", payload);
  return res.data;
}

export async function updateEmployee(
  id: number,
  payload: UpdateEmployeeRequest
) {
  const res = await http.put<EmployeeResponse>(`/api/employees/${id}`, payload);
  return res.data;
}

export async function deleteEmployee(id: number) {
  await http.delete(`/api/employees/${id}`);
}
