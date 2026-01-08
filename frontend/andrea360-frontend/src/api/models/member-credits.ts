import type { AuthMeResponse } from "../auth";
import { http } from "../http";

export type MemberCreditsResponse = {
  memberId: number;
  totalCredits: number;
  creditsByService: Array<{
    fitnessServiceId: number;
    fitnessServiceName: string;
    availableCredits: number;
  }>;
};

export type MemberSessionCardResponse = {
  sessionId: number;
  startsAt: string;
  endsAt: string;
  capacity: number;
  currentBookings: number;
  locationId: number;
  locationName: string;
  fitnessServiceId: number;
  fitnessServiceName: string;
  price: number | null;
};

export type BookSessionResponse = {
  reservationId: number;
  sessionId: number;
  currentBookings: number;
  remainingCreditsForService: number;
};

export async function getMe(): Promise<AuthMeResponse> {
  const { data } = await http.get<AuthMeResponse>("api/auth/me");
  return data;
}

export async function getMemberCredits(
  memberId: number
): Promise<MemberCreditsResponse> {
  const { data } = await http.get<MemberCreditsResponse>("api/member/credits", {
    params: { memberId },
  });
  return data;
}

export async function getMemberSessions(params: {
  memberId: number;
  fitnessServiceId?: number | null;
  date?: string | null; // YYYY-MM-DD
}): Promise<MemberSessionCardResponse[]> {
  const { data } = await http.get<MemberSessionCardResponse[]>(
    "api/member/sessions",
    {
      params: {
        memberId: params.memberId,
        fitnessServiceId: params.fitnessServiceId ?? undefined,
        date: params.date ?? undefined,
      },
    }
  );
  return data;
}

export async function bookMemberSession(
  memberId: number,
  sessionId: number
): Promise<BookSessionResponse> {
  const { data } = await http.post<BookSessionResponse>(
    `api/member/sessions/${sessionId}/book`,
    null,
    {
      params: { memberId },
    }
  );
  return data;
}

export async function getMyCredits(memberId: number) {
  const res = await http.get(`/api/member/credits?memberId=${memberId}`);
  return res.data;
}
