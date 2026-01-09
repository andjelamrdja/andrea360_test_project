import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Alert, AlertDescription } from "../../ui/alert";
import { Calendar, Clock, MapPin, X, AlertCircle } from "lucide-react";

import {
  getMe,
  getMemberSessions,
  type MemberSessionCardResponse,
} from "../../../../api/models/member-credits";
import {
  cancelReservation,
  getMyReservations,
  type ReservationResponse,
} from "../../../../api/models/reservations";
import { useNavigate } from "react-router-dom";

function formatDateLong(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

type UiStatus = "upcoming" | "completed" | "cancelled";
type ViewStatus = "UPCOMING" | "COMPLETED" | "CANCELLED";

function toUiStatus(resStatus: string): UiStatus {
  const s = (resStatus ?? "").toUpperCase();
  if (s === "CANCELLED") return "cancelled";
  if (s === "COMPLETED") return "completed";
  return "upcoming"; // CONFIRMED/CREATED etc.
}

function canCancel(startsAtIso: string) {
  const startsAt = new Date(startsAtIso).getTime();
  const now = Date.now();
  return (startsAt - now) / (1000 * 60 * 60) >= 2;
}

function computeUiStatus(
  resStatus: string,
  startsAtIso: string,
  endsAtIso?: string | null
): UiStatus {
  const s = (resStatus ?? "").toUpperCase();
  if (s === "CANCELLED") return "cancelled";

  const now = Date.now();
  const endMs = endsAtIso
    ? new Date(endsAtIso).getTime()
    : new Date(startsAtIso).getTime();

  return endMs < now ? "completed" : "upcoming";
}

export function MyAppointments() {
  const [memberId, setMemberId] = useState<number | null>(null);
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [sessions, setSessions] = useState<MemberSessionCardResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const me = await getMe();
        if (!alive) return;

        if (!me.memberId) {
          setError("You are not logged in as a member.");
          return;
        }
        setMemberId(me.memberId);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!memberId) return;

    let alive = true;
    (async () => {
      try {
        setError(null);
        setLoading(true);

        const [r, s] = await Promise.all([
          getMyReservations(memberId),
          getMemberSessions({ memberId }),
        ]);

        if (!alive) return;
        setReservations(r);
        setSessions(s);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [memberId]);

  const joined = useMemo(() => {
    const bySessionId = new Map<number, MemberSessionCardResponse>();
    sessions.forEach((s) => bySessionId.set(s.sessionId, s));

    return reservations.map((r) => {
      const s = bySessionId.get(r.sessionId);
      const startsAt = r.sessionStartsAt;
      const endsAt = s?.endsAt ?? null;
      return {
        reservationId: r.id,
        sessionId: r.sessionId,
        startsAt: r.sessionStartsAt,
        endsAt: s?.endsAt ?? null,
        fitnessServiceName: s?.fitnessServiceName ?? "Service",
        locationName: s?.locationName ?? "Location",
        status: r.status,
        uiStatus: computeUiStatus(r.status, startsAt, endsAt),
      };
    });
  }, [reservations, sessions]);

  const upcoming = joined.filter((a) => a.uiStatus === "upcoming");
  const completed = joined.filter((a) => a.uiStatus === "completed");
  const cancelled = joined.filter((a) => a.uiStatus === "cancelled");

  const onCancel = async (apt: (typeof joined)[number]) => {
    const ok = confirm(
      `Are you sure you want to cancel this ${apt.fitnessServiceName} class?`
    );
    if (!ok) return;

    try {
      setError(null);
      setCancellingId(apt.reservationId);

      const updated = await cancelReservation(apt.reservationId);

      setReservations((prev) =>
        prev.map((x) => (x.id === updated.id ? updated : x))
      );
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Cancellation failed.");
    } finally {
      setCancellingId(null);
    }
  };

  const renderCard = (apt: (typeof joined)[number], showActions = false) => {
    const badgeVariant =
      apt.uiStatus === "upcoming"
        ? "default"
        : apt.uiStatus === "completed"
        ? "secondary"
        : "destructive";
    const badgeLabel =
      apt.uiStatus === "upcoming"
        ? "Confirmed"
        : apt.uiStatus === "completed"
        ? "Completed"
        : "Cancelled";

    const showCancel = showActions && apt.uiStatus === "upcoming";
    const late = showCancel && !canCancel(apt.startsAt);

    return (
      <Card
        key={apt.reservationId}
        className="hover:shadow-md transition-shadow"
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 text-lg mb-3">
                {apt.fitnessServiceName}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  {apt.locationName}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  {formatDateLong(apt.startsAt)}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  {formatTime(apt.startsAt)}
                  {apt.endsAt ? ` - ${formatTime(apt.endsAt)}` : ""}
                </div>
              </div>
            </div>
            <Badge variant={badgeVariant as any}>{badgeLabel}</Badge>
          </div>

          {showCancel && (
            <>
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={cancellingId === apt.reservationId}
                onClick={() => onCancel(apt)}
              >
                <X className="w-4 h-4 mr-2" />
                {cancellingId === apt.reservationId
                  ? "Cancelling..."
                  : "Cancel Booking"}
              </Button>

              {late && (
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Cancellation within 2 hours may forfeit the credit.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading)
    return <div className="p-8 text-slate-600">Loading appointments…</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">My Appointments</h2>
        <p className="text-slate-500 mt-1">
          View and manage your class bookings
        </p>
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {upcoming.length === 0 && (
        <Alert className="mb-8">
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            You don't have any upcoming appointments. Book a class to get
            started!
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelled.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcoming.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">No upcoming appointments</p>
                <Button onClick={() => navigate("/member/booking")}>
                  Book a Class
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((apt) => renderCard(apt, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completed.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-slate-500">No completed appointments yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completed.map((apt) => renderCard(apt))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {cancelled.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-slate-500">No cancelled appointments</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cancelled.map((apt) => renderCard(apt))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Cancellation Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                Cancel up to 2 hours before class for a full credit refund
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                Late cancellations (within 2 hours) will forfeit the credit
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                No-shows will forfeit the credit and may affect future bookings
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
