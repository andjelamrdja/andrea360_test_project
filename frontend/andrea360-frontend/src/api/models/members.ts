import { http } from "../http";

export type MemberResponse = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string; // LocalDate -> "YYYY-MM-DD"
  locationId: number;
  locationName: string;
  totalCredits: number;
};

export type CreateMemberRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string; // "YYYY-MM-DD"
  locationId: number;
  password?: string; // backend allows it (not annotated NotNull)
};

export type UpdateMemberRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  locationId: number;
};

export async function getMembers(): Promise<MemberResponse[]> {
  const res = await http.get("/api/members");
  return res.data;
}

export async function createMember(
  payload: CreateMemberRequest
): Promise<MemberResponse> {
  const res = await http.post("/api/members", payload);
  return res.data;
}

export async function updateMember(
  id: number,
  payload: UpdateMemberRequest
): Promise<MemberResponse> {
  const res = await http.put(`/api/members/${id}`, payload);
  return res.data;
}

export async function deleteMember(id: number): Promise<void> {
  await http.delete(`/api/members/${id}`);
}
