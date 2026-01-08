import { http } from "../http";

export interface ReservationResponse {
  id: number;
  memberId: number;
  memberFullName?: string | null;

  sessionId: number;
  sessionStartsAt: string;
  status: string;
  createdAt: string;
  cancelledAt?: string | null;
  note?: string | null;
}

export async function getMyReservations(memberId: number) {
  const res = await http.get<ReservationResponse[]>(`/api/reservations/my`, {
    params: { memberId },
  });
  return res.data;
}

export async function cancelReservation(reservationId: number) {
  const res = await http.patch<ReservationResponse>(
    `/api/reservations/${reservationId}/cancel`
  );
  return res.data;
}
