import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import { Alert, AlertDescription } from "../../ui/alert";

import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Activity,
  AlertCircle,
} from "lucide-react";

import {
  getMe,
  getMemberCredits,
  type MemberCreditsResponse,
} from "../../../../api/models/member-credits";

import {
  getMemberMe,
  type MemberResponse,
} from "../../../../api/models/members";

import {
  getMyReservations,
  type ReservationResponse,
} from "../../../../api/models/reservations";

type MemberProfile = {
  id: number;
  fullName?: string;
  email?: string;
  phone?: string | null;
  locationName?: string | null;
  joinDate?: string | null; // ISO string
};

async function getMemberProfile(): Promise<MemberProfile> {
  const m: MemberResponse = await getMemberMe();

  // ✅ Adjust these based on your real MemberResponse
  const joinDate =
    // @ts-expect-error - depending on your DTO
    m.createdAt ??
    // @ts-expect-error - depending on your DTO
    m.joinDate ??
    // @ts-expect-error - depending on your DTO
    m.createdOn ??
    null;

  return {
    id: m.id,
    fullName:
      `${(m as any).firstName ?? ""} ${(m as any).lastName ?? ""}`.trim() ||
      "Member",
    email: m.email,
    phone: (m as any).phone ?? null,
    locationName: (m as any).locationName ?? null,
    joinDate,
  };
}

function formatMonthYear(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatLongDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function isPast(iso: string | null | undefined) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t < Date.now();
}

export function MyProfile() {
  const navigate = useNavigate();

  const [memberId, setMemberId] = useState<number | null>(null);
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [credits, setCredits] = useState<MemberCreditsResponse | null>(null);
  const [myReservations, setMyReservations] = useState<ReservationResponse[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1) Resolve memberId from /api/auth/me
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
        if (!alive) return;
        setError(e?.response?.data?.message ?? "Failed to load profile.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // 2) Load member profile + credits + reservations
  useEffect(() => {
    if (!memberId) return;

    let alive = true;

    (async () => {
      try {
        setError(null);
        setLoading(true);

        const [m, c, r] = await Promise.all([
          getMemberProfile(), // uses /api/members/me
          getMemberCredits(memberId), // uses memberId
          getMyReservations(memberId), // for Total Classes
        ]);

        if (!alive) return;
        setMember(m);
        setCredits(c);
        setMyReservations(r);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message ?? "Failed to load member data.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [memberId]);

  const totalCredits = credits?.totalCredits ?? 0;
  const creditsByService = credits?.creditsByService ?? [];

  const displayName = member?.fullName ?? "Member";
  const displayEmail = member?.email ?? "—";
  const displayPhone = member?.phone ?? "—";
  const displayLocation = member?.locationName ?? "—";
  const joinDateIso = member?.joinDate ?? null;

  const classesAttended = useMemo(() => {
    // attended = non-cancelled reservations in the past
    return myReservations.filter((r: any) => {
      const status = (r.status ?? "").toUpperCase();
      if (status === "CANCELLED") return false;

      // prefer sessionEndsAt if exists, fallback to sessionStartsAt
      const endIso = r.sessionEndsAt ?? null;
      const startIso = r.sessionStartsAt ?? null;

      return isPast(endIso) || isPast(startIso);
    }).length;
  }, [myReservations]);

  const activityStats = useMemo(() => {
    return [
      { label: "Total Classes", value: classesAttended, icon: Activity },
      { label: "Active Credits", value: totalCredits, icon: CreditCard },
      { label: "Total Spent", value: "—", icon: CreditCard }, // needs payments endpoint
      {
        label: "Member Since",
        value: formatMonthYear(joinDateIso),
        icon: Calendar,
      },
    ];
  }, [classesAttended, totalCredits, joinDateIso]);

  if (loading) {
    return <div className="p-8 text-slate-600">Loading profile…</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">My Profile</h2>
        <p className="text-slate-500 mt-1">Manage your account information</p>
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="name" defaultValue={displayName} disabled />
                  <Button variant="outline" disabled>
                    Edit
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="email"
                    type="email"
                    defaultValue={displayEmail}
                    disabled
                  />
                  <Button variant="outline" disabled>
                    Edit
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue={displayPhone}
                    disabled
                  />
                  <Button variant="outline" disabled>
                    Edit
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Primary Location</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="location"
                    defaultValue={displayLocation}
                    disabled
                  />
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Contact staff to change your location
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {activityStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <p className="text-sm text-slate-600">{stat.label}</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
              >
                Change Password
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
              >
                Notification Preferences
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
              >
                Privacy Settings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg">
                  {displayName}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{displayEmail}</p>
                <Badge className="mt-3">Active Member</Badge>
                <Button variant="outline" className="w-full mt-4" disabled>
                  Upload Photo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Credits</CardTitle>
            </CardHeader>
            <CardContent>
              {creditsByService.length === 0 ? (
                <div className="text-sm text-slate-500">No credits yet.</div>
              ) : (
                <div className="space-y-2">
                  {creditsByService.map((c) => (
                    <div
                      key={c.fitnessServiceId}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded"
                    >
                      <span className="text-sm text-slate-600">
                        {c.fitnessServiceName}
                      </span>
                      <Badge variant="secondary">
                        {c.availableCredits} left
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              <Button
                className="w-full mt-4"
                onClick={() => navigate("/member/purchase")}
              >
                Buy More Credits
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Email</p>
                  <p className="text-sm text-slate-600">{displayEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Phone</p>
                  <p className="text-sm text-slate-600">{displayPhone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Location</p>
                  <p className="text-sm text-slate-600">{displayLocation}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Member Since
                  </p>
                  <p className="text-sm text-slate-600">
                    {formatLongDate(joinDateIso)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
