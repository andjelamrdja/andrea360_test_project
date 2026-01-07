import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

import {
  createSession,
  deleteSession,
  getSessions,
  updateSession,
  type SessionResponse,
  type SessionStatus,
} from "../../../../api/models/session";

import {
  getLocations,
  type LocationResponse,
} from "../../../../api/models/locations";
import {
  getEmployees,
  type EmployeeResponse,
} from "../../../../api/models/employees";
import {
  getFitnessServices,
  type FitnessServiceResponse,
} from "../../../../api/models/fitness-services";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

type Props = {
  userRole: "admin" | "employee";
  locationId?: number; // use number in your app; if you have string, we can adjust
};

type FormState = {
  fitnessServiceId: string;
  locationId: string;
  trainerEmployeeId: string;

  date: string; // yyyy-mm-dd
  startTime: string; // hh:mm
  endTime: string; // hh:mm

  capacity: string;
  status: SessionStatus; // edit only (we still store it)
};

function toLocalDate(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function toLocalTime(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// Builds ISO string from local date+time in user's current timezone
function combineLocal(date: string, time: string) {
  // date: 2026-01-07, time: 08:00
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0);
  return dt.toISOString(); // backend expects OffsetDateTime; ISO string is fine
}

function statusBadge(status: string) {
  if (status === "CANCELLED")
    return { label: "Cancelled", variant: "destructive" as const };
  return { label: "Scheduled", variant: "secondary" as const };
}

export function SessionsManagement({ userRole, locationId }: Props) {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [services, setServices] = useState<FitnessServiceResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionResponse | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormState>({
    fitnessServiceId: "",
    locationId: locationId ? String(locationId) : "",
    trainerEmployeeId: "",
    date: "",
    startTime: "",
    endTime: "",
    capacity: "",
    status: "SCHEDULED",
  });

  async function load() {
    setIsLoading(true);
    setError(null);

    try {
      const [sess, locs, svcs, emps] = await Promise.all([
        getSessions(),
        getLocations(),
        getFitnessServices(),
        getEmployees(),
      ]);

      setSessions(sess);
      setLocations(locs);
      setServices(svcs);
      setEmployees(emps);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load sessions data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setFormData({
      fitnessServiceId: "",
      locationId: locationId ? String(locationId) : "",
      trainerEmployeeId: "",
      date: "",
      startTime: "",
      endTime: "",
      capacity: "",
      status: "SCHEDULED",
    });
  }

  function handleAddNew() {
    setEditingSession(null);
    resetForm();
    setIsDialogOpen(true);
  }

  function handleEdit(s: SessionResponse) {
    setEditingSession(s);
    setFormData({
      fitnessServiceId: String(s.fitnessServiceId),
      locationId: String(s.locationId),
      trainerEmployeeId: String(s.trainerEmployeeId),
      date: toLocalDate(s.startsAt),
      startTime: toLocalTime(s.startsAt),
      endTime: toLocalTime(s.endsAt),
      capacity: String(s.capacity),
      status: (s.status as SessionStatus) || "SCHEDULED",
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const fitnessServiceIdNum = Number(formData.fitnessServiceId);
    const locationIdNum = Number(formData.locationId);
    const trainerIdNum = Number(formData.trainerEmployeeId);
    const capNum = Number(formData.capacity);

    if (!fitnessServiceIdNum || Number.isNaN(fitnessServiceIdNum)) {
      setIsSaving(false);
      setError("Please select a service.");
      return;
    }
    if (!locationIdNum || Number.isNaN(locationIdNum)) {
      setIsSaving(false);
      setError("Please select a location.");
      return;
    }
    if (!trainerIdNum || Number.isNaN(trainerIdNum)) {
      setIsSaving(false);
      setError("Please select a trainer.");
      return;
    }
    if (!formData.date || !formData.startTime || !formData.endTime) {
      setIsSaving(false);
      setError("Please set date, start time and end time.");
      return;
    }
    if (!capNum || Number.isNaN(capNum) || capNum < 1) {
      setIsSaving(false);
      setError("Capacity must be a number >= 1.");
      return;
    }

    const startsAt = combineLocal(formData.date, formData.startTime);
    const endsAt = combineLocal(formData.date, formData.endTime);

    try {
      if (editingSession) {
        const updated = await updateSession(editingSession.id, {
          startsAt,
          endsAt,
          capacity: capNum,
          status: formData.status,
          locationId: locationIdNum,
          fitnessServiceId: fitnessServiceIdNum,
          trainerEmployeeId: trainerIdNum,
        });

        setSessions((prev) =>
          prev.map((x) => (x.id === updated.id ? updated : x))
        );
      } else {
        const created = await createSession({
          startsAt,
          endsAt,
          capacity: capNum,
          locationId: locationIdNum,
          fitnessServiceId: fitnessServiceIdNum,
          trainerEmployeeId: trainerIdNum,
        });

        setSessions((prev) => [created, ...prev]);
      }

      setIsDialogOpen(false);
      setEditingSession(null);
      resetForm();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const ok = window.confirm("Delete this session?");
    if (!ok) return;

    setDeletingId(id);
    setError(null);

    const snapshot = sessions;
    setSessions((prev) => prev.filter((s) => s.id !== id));

    try {
      await deleteSession(id);
    } catch (e: any) {
      setSessions(snapshot);
      setError(e?.response?.data?.message ?? "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  // Filter for employee location (frontend-only; backend returns all)
  const scopedSessions = useMemo(() => {
    if (userRole === "employee" && locationId) {
      return sessions.filter((s) => s.locationId === locationId);
    }
    return sessions;
  }, [sessions, userRole, locationId]);

  // Tabs: today/upcoming/all
  const todayKey = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const todaySessions = useMemo(
    () => scopedSessions.filter((s) => toLocalDate(s.startsAt) === todayKey),
    [scopedSessions, todayKey]
  );
  const upcomingSessions = useMemo(
    () => scopedSessions.filter((s) => toLocalDate(s.startsAt) > todayKey),
    [scopedSessions, todayKey]
  );

  const renderCard = (s: SessionResponse) => {
    const dateStr = new Date(s.startsAt).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    const start = toLocalTime(s.startsAt);
    const end = toLocalTime(s.endsAt);

    const badge = statusBadge(s.status);

    return (
      <div
        key={s.id}
        className="rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 text-lg">
                {s.fitnessServiceName}
              </h3>

              <div className="flex flex-wrap gap-3 mt-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  {start} - {end}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  {dateStr}
                </div>
              </div>

              {userRole === "admin" && (
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <MapPin className="w-4 h-4" />
                  {s.locationName}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  Capacity: <span className="font-semibold">{s.capacity}</span>
                </div>
                <div className="text-slate-500">
                  Trainer:{" "}
                  <span className="font-medium text-slate-700">
                    {s.trainerName}
                  </span>
                </div>
              </div>
            </div>

            <Badge variant={badge.variant} className="ml-2">
              {badge.label}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleEdit(s)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDelete(s.id)}
              disabled={deletingId === s.id}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Appointments Management
          </h2>
          <p className="text-slate-500 mt-1">
            {userRole === "admin"
              ? "Manage appointments across all locations"
              : "Manage appointments for your location"}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Appointment
            </Button>
          </DialogTrigger>

          <DialogContent className="p-8">
            <DialogHeader>
              <DialogTitle>
                {editingSession ? "Edit Appointment" : "Create New Appointment"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label className="p-1">Service</Label>
                <Select
                  value={formData.fitnessServiceId}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, fitnessServiceId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((svc) => (
                      <SelectItem key={svc.id} value={String(svc.id)}>
                        {svc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {userRole === "admin" && (
                <div>
                  <Label className="p-1">Location</Label>
                  <Select
                    value={formData.locationId}
                    onValueChange={(value) =>
                      setFormData((p) => ({ ...p, locationId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={String(loc.id)}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="p-1">Trainer</Label>
                <Select
                  value={formData.trainerEmployeeId}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, trainerEmployeeId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={String(emp.id)}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {editingSession && (
                <div>
                  <Label className="p-1">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: SessionStatus) =>
                      setFormData((p) => ({ ...p, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="p-1" htmlFor="date">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, date: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="p-1" htmlFor="startTime">
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, startTime: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label className="p-1" htmlFor="endTime">
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, endTime: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="p-1" htmlFor="capacity">
                  Capacity
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, capacity: e.target.value }))
                  }
                  placeholder="e.g., 20"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving
                    ? "Saving..."
                    : editingSession
                    ? "Update"
                    : "Create"}{" "}
                  Appointment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-slate-500">Loading appointments...</div>
      ) : (
        <Tabs defaultValue="today" className="w-full">
          <TabsList>
            <TabsTrigger value="today">
              Today ({todaySessions.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({scopedSessions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todaySessions.map(renderCard)}
              {todaySessions.length === 0 && (
                <div className="col-span-full rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500">
                  No sessions today.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingSessions.map(renderCard)}
              {upcomingSessions.length === 0 && (
                <div className="col-span-full rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500">
                  No upcoming sessions.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scopedSessions.map(renderCard)}
              {scopedSessions.length === 0 && (
                <div className="col-span-full rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500">
                  No sessions found.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
