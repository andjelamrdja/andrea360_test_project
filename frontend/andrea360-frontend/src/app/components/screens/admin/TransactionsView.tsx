import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Badge } from "../../ui/badge";
import { Card, CardContent } from "../../ui/card";
import { DollarSign, TrendingUp, Calendar, CreditCard } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

import {
  getPayments,
  updatePayment,
  type PaymentResponse,
  type PaymentStatus,
} from "../../../../api/models/payments";

type Props = {
  userRole: "admin" | "employee";
  locationId?: number; // employee location (optional)
};

// ✅ Your backend PaymentResponse (from code you sent) does NOT include these,
// but your UI wants them (memberName, locationName, etc).
// We keep them as OPTIONAL so the component compiles even if backend doesn’t send them yet.
type PaymentRow = PaymentResponse & {
  memberName?: string;
  locationId?: number;
  locationName?: string;
};

type UiPaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";

function statusToBadgeVariant(
  status: UiPaymentStatus
): "default" | "secondary" | "destructive" {
  if (status === "PAID") return "default";
  if (status === "PENDING") return "secondary";
  return "destructive"; // FAILED, CANCELLED
}

function statusLabel(status: UiPaymentStatus) {
  if (status === "PAID") return "paid";
  if (status === "PENDING") return "pending";
  if (status === "FAILED") return "failed";
  return "cancelled";
}

function toUiStatus(s: PaymentStatus): UiPaymentStatus {
  // PaymentStatus from backend enum: PENDING, PAID, FAILED, CANCELLED
  return s as UiPaymentStatus;
}

export function TransactionsView({ userRole, locationId }: Props) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // inline edit
  const [editingStatusId, setEditingStatusId] = useState<number | null>(null);
  const [statusSavingId, setStatusSavingId] = useState<number | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPayments();
      // cast to PaymentRow (optional fields won’t hurt)
      setPayments(data as PaymentRow[]);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load transactions.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const scoped = useMemo(() => {
    // ⚠️ Only works if backend returns locationId on payment rows.
    // If not, employees will see all payments (or you can later add an endpoint like /api/payments?locationId=...)
    if (userRole === "employee" && locationId) {
      return payments.filter((p) => p.locationId === locationId);
    }
    return payments;
  }, [payments, userRole, locationId]);

  const statusFiltered = useMemo(() => {
    if (filterStatus === "all") return scoped;
    return scoped.filter((p) => p.status === filterStatus);
  }, [scoped, filterStatus]);

  const totalRevenue = useMemo(() => {
    return scoped
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + Number(p.amount), 0);
  }, [scoped]);

  const todayRevenue = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return scoped
      .filter((p) => p.status === "PAID")
      .filter((p) => {
        const iso = String(p.paidAt ?? p.createdAt);
        return iso.slice(0, 10) === today;
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);
  }, [scoped]);

  const completedCount = useMemo(
    () => scoped.filter((p) => p.status === "PAID").length,
    [scoped]
  );

  async function autoUpdateStatus(
    paymentId: number,
    newStatus: UiPaymentStatus
  ) {
    setStatusSavingId(paymentId);
    setError(null);

    try {
      // ⚠️ This requires backend support!
      // Your UpdatePaymentRequest currently does NOT have `status`.
      // You must add it (or create a PATCH /api/payments/{id}/status endpoint).
      const updated = await updatePayment(paymentId, {
        status: newStatus,
      } as any);

      setPayments((prev) =>
        prev.map((p) => (p.id === updated.id ? (updated as PaymentRow) : p))
      );
      setEditingStatusId(null);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to update status.");
    } finally {
      setStatusSavingId(null);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Transactions</h2>
        <p className="text-slate-500 mt-1">
          {userRole === "admin"
            ? "View all payment transactions"
            : "View transactions for your location"}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-slate-900">
                  €{totalRevenue.toFixed(2)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    via paid payments
                  </span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Today's Revenue</p>
                <p className="text-3xl font-bold text-slate-900">
                  €{todayRevenue.toFixed(2)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  Completed Transactions
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {completedCount}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-600">
                    Stripe ref: externalRef
                  </span>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        {isLoading ? (
          <div className="p-6 text-slate-500">Loading transactions...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Service</TableHead>
                {userRole === "admin" && <TableHead>Location</TableHead>}
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction ID</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {statusFiltered.map((p) => {
                const date = new Date(p.paidAt ?? p.createdAt);
                const uiStatus = toUiStatus(p.status);

                const isEditing =
                  userRole === "admin" && editingStatusId === p.id;
                const isSaving = statusSavingId === p.id;

                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-slate-900">
                          {date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-slate-500">
                          {date.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-medium">
                      {/* backend has memberId; name is optional */}
                      {p.memberName ?? `Member #${p.memberId}`}
                    </TableCell>

                    <TableCell className="text-sm text-slate-600">
                      {p.fitnessServiceName}
                      {p.quantity && p.quantity > 1 ? ` (x${p.quantity})` : ""}
                    </TableCell>

                    {userRole === "admin" && (
                      <TableCell className="text-sm text-slate-600">
                        {p.locationName ?? "—"}
                      </TableCell>
                    )}

                    <TableCell className="font-semibold text-green-600">
                      {p.currency ? `${p.currency} ` : "€"}
                      {Number(p.amount).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <div className="min-w-[170px]">
                          <Select
                            value={uiStatus}
                            onValueChange={(v) =>
                              autoUpdateStatus(p.id, v as UiPaymentStatus)
                            }
                          >
                            <SelectTrigger
                              className="h-8"
                              disabled={isSaving}
                              // click outside / blur to cancel
                              onBlur={() => {
                                // small delay so select click works
                                setTimeout(() => {
                                  setEditingStatusId((cur) =>
                                    cur === p.id ? null : cur
                                  );
                                }, 150);
                              }}
                            >
                              <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="PAID">Paid</SelectItem>
                              <SelectItem value="FAILED">Failed</SelectItem>
                              <SelectItem value="CANCELLED">
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <div className="mt-1 text-[11px] text-slate-400">
                            Click outside to cancel
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex"
                          onClick={() => {
                            if (userRole !== "admin") return;
                            setEditingStatusId(p.id);
                          }}
                          disabled={userRole !== "admin" || isSaving}
                          title={
                            userRole === "admin"
                              ? "Click to change status"
                              : undefined
                          }
                        >
                          <Badge variant={statusToBadgeVariant(uiStatus)}>
                            {isSaving ? "saving..." : statusLabel(uiStatus)}
                          </Badge>
                        </button>
                      )}
                    </TableCell>

                    <TableCell>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                        {p.externalRef ?? `payment_${p.id}`}
                      </code>
                    </TableCell>
                  </TableRow>
                );
              })}

              {statusFiltered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={userRole === "admin" ? 7 : 6}
                    className="text-slate-500 py-10 text-center"
                  >
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
