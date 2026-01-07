import { http } from "./http";

export type AuthMeResponse = {
  email: string;
  userType: "EMPLOYEE" | "MEMBER";
  authRole: "ADMIN" | "EMPLOYEE" | null;
  authorities: string[];
};

export async function fetchMe() {
  const res = await http.get<AuthMeResponse>("/api/auth/me");
  return res.data;
}
