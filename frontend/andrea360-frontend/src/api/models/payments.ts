import { http } from "../http";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";
export type PaymentMethod = "CASH" | "CARD" | "ONLINE";

export type UpdatePaymentRequest = {
  status?: PaymentStatus;
  externalRef?: string;
  quantity?: number;
  amount?: string;
  currency?: string;
};

export type PaymentResponse = {
  id: number;

  memberId: number;
  memberName: string;

  locationId: number;
  locationName: string;

  fitnessServiceId: number;
  fitnessServiceName: string;

  amount: string;
  currency: string;

  method: PaymentMethod;
  status: PaymentStatus;

  createdAt: string;
  paidAt?: string | null;

  externalRef?: string | null;

  quantity: number;
  creditsApplied: boolean;

  checkoutUrl?: string | null;
};

export type CreatePaymentRequest = {
  memberId: number;
  fitnessServiceId: number;
  quantity: number;
  currency?: string;
  amount?: number;
};

export type CreateCheckoutSessionRequest = {
  fitnessServiceId: number;
  quantity: number;
  currency?: string;
};

export type CreateCheckoutSessionResponse = {
  url: string;
  sessionId: string;
  paymentId: number;
};

export async function getPayments(): Promise<PaymentResponse[]> {
  const res = await http.get("/api/payments");
  return res.data;
}

export async function updatePayment(id: number, payload: UpdatePaymentRequest) {
  const res = await http.put(`/api/payments/${id}`, payload);
  return res.data as PaymentResponse;
}

export async function createPayment(req: CreatePaymentRequest) {
  const res = await http.post("/api/payments", req);
  return res.data;
}

export async function createCheckoutSession(
  req: CreateCheckoutSessionRequest
): Promise<CreateCheckoutSessionResponse> {
  const { data } = await http.post<CreateCheckoutSessionResponse>(
    "/api/payments/stripe/checkout-session",
    req
  );
  return data;
}
