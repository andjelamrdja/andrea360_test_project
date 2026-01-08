import { useEffect, useMemo, useState } from "react";

import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import {
  bookMemberSession,
  getMe,
  getMemberCredits,
  getMemberSessions,
  type MemberCreditsResponse,
  type MemberSessionCardResponse,
} from "../../../../api/models/member-credits";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Progress } from "../../ui/progress";
import { Button } from "../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Alert, AlertDescription } from "../../ui/alert";
import {
  getMyReservations,
  type ReservationResponse,
} from "../../../../api/models/reservations";

function toYyyyMmDd(iso: string) {
  return iso.slice(0, 10);
}

function formatDateLong(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatDateShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
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

export function MemberBooking() {
  const [memberId, setMemberId] = useState<number | null>(null);
  const [credits, setCredits] = useState<MemberCreditsResponse | null>(null);
  const [sessions, setSessions] = useState<MemberSessionCardResponse[]>([]);

  const [selectedService, setSelectedService] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("all");

  const [loading, setLoading] = useState(true);
  const [bookingIdLoading, setBookingIdLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myReservations, setMyReservations] = useState<ReservationResponse[]>(
    []
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const me = await getMe();
        if (!alive) return;

        if (!me.memberId) {
          setError("You are not logged in as a member.");
          setLoading(false);
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

  // 2) Load credits + sessions once we have memberId
  useEffect(() => {
    if (!memberId) return;

    let alive = true;
    (async () => {
      try {
        setError(null);
        setLoading(true);

        const [c, s, r] = await Promise.all([
          getMemberCredits(memberId),
          getMemberSessions({ memberId }),
          getMyReservations(memberId),
        ]);

        if (!alive) return;
        setCredits(c);
        setSessions(s);
        setMyReservations(r);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Failed to load booking data.");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [memberId]);

  const services = useMemo(() => {
    const map = new Map<number, string>();
    sessions.forEach((s) => map.set(s.fitnessServiceId, s.fitnessServiceName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [sessions]);

  const dates = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => set.add(toYyyyMmDd(s.startsAt)));
    return Array.from(set).sort();
  }, [sessions]);

  const creditsByServiceId = useMemo(() => {
    const map = new Map<number, number>();
    (credits?.creditsByService ?? []).forEach((c) =>
      map.set(c.fitnessServiceId, c.availableCredits)
    );
    return map;
  }, [credits]);

  const totalCredits = credits?.totalCredits ?? 0;

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const serviceMatch =
        selectedService === "all" ||
        String(s.fitnessServiceId) === selectedService;
      const dateMatch =
        selectedDate === "all" || toYyyyMmDd(s.startsAt) === selectedDate;
      return serviceMatch && dateMatch;
    });
  }, [sessions, selectedService, selectedDate]);

  const bookedSessionIds = useMemo(() => {
    return new Set(
      myReservations
        .filter((r) => (r.status ?? "").toUpperCase() !== "CANCELLED")
        .map((r) => r.sessionId)
    );
  }, [myReservations]);

  const onBook = async (session: MemberSessionCardResponse) => {
    if (!memberId) return;

    try {
      setError(null);
      setBookingIdLoading(session.sessionId);

      const res = await bookMemberSession(memberId, session.sessionId);
      const r = await getMyReservations(memberId);
      setMyReservations(r);

      setSessions((prev) =>
        prev.map((x) =>
          x.sessionId === session.sessionId
            ? { ...x, currentBookings: res.currentBookings }
            : x
        )
      );

      setCredits((prev) => {
        if (!prev) return prev;
        const updated = prev.creditsByService.map((c) =>
          c.fitnessServiceId === session.fitnessServiceId
            ? { ...c, availableCredits: res.remainingCreditsForService }
            : c
        );
        const newTotal = updated.reduce(
          (sum, c) => sum + c.availableCredits,
          0
        );
        return { ...prev, creditsByService: updated, totalCredits: newTotal };
      });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Booking failed.");
    } finally {
      setBookingIdLoading(null);
    }
  };

  const renderCard = (s: MemberSessionCardResponse) => {
    const capacityPercentage = (s.currentBookings / s.capacity) * 100;
    const isFull = s.currentBookings >= s.capacity;
    const isAlmostFull = capacityPercentage >= 90;
    const isFilling = capacityPercentage >= 70 && capacityPercentage < 90;

    const creditsForService = creditsByServiceId.get(s.fitnessServiceId) ?? 0;
    const hasCredits = creditsForService > 0;

    const isBooked = bookedSessionIds.has(s.sessionId);
    const canBook = !isFull && hasCredits && !isBooked;

    return (
      <Card
        key={s.sessionId}
        className={`hover:shadow-lg transition-shadow ${
          isFull ? "opacity-60" : ""
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 text-lg mb-2">
                {s.fitnessServiceName}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  {s.locationName}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  {formatDateLong(s.startsAt)}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  {formatTime(s.startsAt)} - {formatTime(s.endsAt)}
                </div>
              </div>
            </div>
            <Badge
              variant={
                isFull ? "destructive" : isAlmostFull ? "default" : "secondary"
              }
            >
              {isFull
                ? "Full"
                : isAlmostFull
                ? "Almost Full"
                : isFilling
                ? "Filling Fast"
                : "Available"}
            </Badge>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">Spots Available</span>
              </div>
              <span className="font-semibold">
                {s.capacity - s.currentBookings}/{s.capacity}
              </span>
            </div>

            <Progress
              value={capacityPercentage}
              className={
                isFull || isAlmostFull
                  ? "[&>div]:bg-red-500"
                  : isFilling
                  ? "[&>div]:bg-orange-500"
                  : "[&>div]:bg-blue-600"
              }
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 animate-pulse">
                ● Live updates
              </span>
              <span className="text-slate-600">
                {s.capacity - s.currentBookings} spots left
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-600">Your Credits:</span>
            </div>
            <Badge variant={hasCredits ? "default" : "destructive"}>
              {creditsForService} available
            </Badge>
          </div>

          <Button
            className="w-full"
            disabled={!canBook || bookingIdLoading === s.sessionId}
            onClick={() => onBook(s)}
          >
            {bookingIdLoading === s.sessionId
              ? "Booking..."
              : isBooked
              ? "Already booked"
              : isFull
              ? "Class Full"
              : !hasCredits
              ? "No Credits Available"
              : "Book This Class"}
          </Button>

          {!hasCredits && !isFull && (
            <p className="text-xs text-center text-slate-500 mt-2">
              Purchase credits to book this class
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <div className="p-8 text-slate-600">Loading booking data…</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Book a Class</h2>
        <p className="text-slate-500 mt-1">
          Browse available classes and book your spot
        </p>
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Your Available Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(credits?.creditsByService ?? []).map((c) => (
              <div
                key={c.fitnessServiceId}
                className="p-4 bg-blue-50 rounded-lg"
              >
                <p className="text-sm text-slate-600 mb-1">
                  {c.fitnessServiceName}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {c.availableCredits}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-slate-50 rounded-lg flex items-center justify-between">
            <span className="font-medium text-slate-900">Total Credits:</span>
            <span className="text-2xl font-bold text-blue-600">
              {totalCredits}
            </span>
          </div>
        </CardContent>
      </Card>

      {totalCredits === 0 && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have any credits. Purchase credits to start booking
            classes.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 mb-6 flex-wrap">
        <Select value={selectedService} onValueChange={setSelectedService}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            {services.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDate} onValueChange={setSelectedDate}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            {dates.map((d) => (
              <SelectItem key={d} value={d}>
                {formatDateShort(d + "T00:00:00Z")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSessions.map(renderCard)}
      </div>
    </div>
  );
}
