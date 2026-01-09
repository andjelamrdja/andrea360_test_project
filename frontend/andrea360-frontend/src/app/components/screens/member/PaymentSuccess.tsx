import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Receipt,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { http } from "../../../../api/http";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Alert, AlertDescription } from "../../ui/alert";

type State = "loading" | "success" | "error";

export function PaymentSuccess() {
  const nav = useNavigate();

  const sessionId = useMemo(() => {
    return new URLSearchParams(window.location.search).get("session_id");
  }, []);

  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState<string>(
    "Confirming your payment with Stripe…"
  );
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const [seconds, setSeconds] = useState<number>(8);

  useEffect(() => {
    if (!sessionId) {
      setState("error");
      setMessage("Missing session_id in URL. We can’t confirm your payment.");
      return;
    }

    (async () => {
      try {
        const res = await http.get("/api/payments/stripe/confirm", {
          params: { sessionId },
        });
        const data = res.data as any;

        setPaymentId(data?.id ?? null);

        setReceiptUrl(data?.receiptUrl ?? null);

        setState("success");
        setMessage(
          "Payment confirmed. Credits have been added to your account."
        );
      } catch (e: any) {
        const backendMsg =
          e?.response?.data?.message ||
          e?.response?.data ||
          "We couldn’t confirm your payment. If you were charged, please contact support.";
        setState("error");
        setMessage(String(backendMsg));
      }
    })();
  }, [sessionId]);

  useEffect(() => {
    if (state !== "success") return;
    if (seconds <= 0) return;

    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [state, seconds]);

  useEffect(() => {
    if (state === "success" && seconds === 0) {
      nav("/member/purchase");
    }
  }, [state, seconds, nav]);

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => nav("/member/purchase")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Badge variant="outline" className="bg-white">
            Stripe Test Mode
          </Badge>
        </div>

        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="relative">
            {/* subtle decorative accent */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-100 blur-2xl" />
            <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-emerald-100 blur-2xl" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl text-slate-900">
                  {state === "loading" && "Processing payment"}
                  {state === "success" && "Payment successful"}
                  {state === "error" && "Payment confirmation failed"}
                </CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  {state === "loading" &&
                    "Please don’t close this tab. We’re confirming your purchase."}
                  {state === "success" &&
                    "You’re all set. Your credits are ready to use."}
                  {state === "error" &&
                    "We couldn’t confirm this payment automatically."}
                </p>
              </div>

              <div className="mt-1">
                {state === "loading" && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Confirming
                  </div>
                )}
                {state === "success" && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmed
                  </div>
                )}
                {state === "error" && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-sm text-rose-700">
                    <XCircle className="h-4 w-4" />
                    Action needed
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert
              className={
                state === "success"
                  ? "border-emerald-200 bg-emerald-50"
                  : state === "error"
                  ? "border-rose-200 bg-rose-50"
                  : "border-blue-200 bg-blue-50"
              }
            >
              <AlertDescription
                className={
                  state === "success"
                    ? "text-emerald-900"
                    : state === "error"
                    ? "text-rose-900"
                    : "text-blue-900"
                }
              >
                {message}
              </AlertDescription>
            </Alert>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-slate-600">
                  <div className="font-medium text-slate-900">Reference</div>
                  <div className="mt-1 font-mono text-xs text-slate-600 break-all">
                    {sessionId ?? "—"}
                  </div>
                </div>

                {paymentId != null && (
                  <div className="text-right text-sm text-slate-600">
                    <div className="font-medium text-slate-900">Payment ID</div>
                    <div className="mt-1 font-mono text-xs">{paymentId}</div>
                  </div>
                )}
              </div>
            </div>

            {state === "success" && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Sparkles className="h-4 w-4" />
                  Redirecting back in{" "}
                  <span className="font-semibold text-slate-800">
                    {seconds}s
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">You can continue now</span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {receiptUrl && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => window.open(receiptUrl, "_blank")}
                    >
                      <Receipt className="h-4 w-4" />
                      View receipt
                    </Button>
                  )}

                  <Button
                    onClick={() => nav("/member/purchase")}
                    className="gap-2"
                  >
                    Continue
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </div>
              </div>
            )}

            {state === "error" && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </Button>
                <Button onClick={() => nav("/member/purchase")}>
                  Go back to purchase
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-400">
          If you believe you were charged but credits didn’t update, please
          contact the admin with the reference above.
        </p>
      </div>
    </div>
  );
}
