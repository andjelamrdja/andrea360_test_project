import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  CreditCard,
} from "lucide-react";

import {
  createMember,
  deleteMember,
  getMembers,
  updateMember,
  type MemberResponse,
} from "../../../../api/models/members";

import {
  getLocations,
  type LocationResponse,
} from "../../../../api/models/locations";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "../../ui/alert-dialog";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { AlertDialogAction } from "../../ui/alert-dialog";
import { Badge } from "../../ui/badge";

type Props = {
  userRole: "admin" | "employee";
  locationId?: number; // employee location
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string; // yyyy-mm-dd
  locationId: string; // select
  password: string; // create
};

export function MembersManagement({ userRole, locationId }: Props) {
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [locations, setLocations] = useState<LocationResponse[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberResponse | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [filterLocation, setFilterLocation] = useState<string>("all");

  const [formData, setFormData] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    locationId: locationId ? String(locationId) : "",
    password: "",
  });

  async function load() {
    setIsLoading(true);
    setError(null);

    try {
      const [mems, locs] = await Promise.all([getMembers(), getLocations()]);
      setMembers(mems);
      setLocations(locs);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ?? "Failed to load members/locations."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      locationId: locationId ? String(locationId) : "",
      password: "",
    });
  }

  function handleAddNew() {
    setEditingMember(null);
    resetForm();
    setIsDialogOpen(true);
  }

  function handleEdit(m: MemberResponse) {
    setEditingMember(m);
    setFormData({
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      phone: m.phone ?? "",
      dateOfBirth: m.dateOfBirth,
      locationId: String(m.locationId),
      password: "",
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const locIdNum =
      userRole === "employee" && locationId
        ? locationId
        : Number(formData.locationId);

    if (!locIdNum || Number.isNaN(locIdNum)) {
      setIsSaving(false);
      setError("Please select a location.");
      return;
    }

    try {
      if (editingMember) {
        const updated = await updateMember(editingMember.id, {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          dateOfBirth: formData.dateOfBirth,
          locationId: locIdNum,
        });

        setMembers((prev) =>
          prev.map((x) => (x.id === updated.id ? updated : x))
        );
      } else {
        const created = await createMember({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          dateOfBirth: formData.dateOfBirth,
          locationId: locIdNum,
          password: formData.password.trim() || undefined,
        });

        setMembers((prev) => [created, ...prev]);
      }

      setIsDialogOpen(false);
      setEditingMember(null);
      resetForm();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    setError(null);

    const snapshot = members;
    setMembers((prev) => prev.filter((m) => m.id !== id));

    try {
      await deleteMember(id);
    } catch (e: any) {
      setMembers(snapshot);
      setError(e?.response?.data?.message ?? "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  const scopedMembers = useMemo(() => {
    if (userRole === "employee" && locationId) {
      return members.filter((m) => m.locationId === locationId);
    }
    return members;
  }, [members, userRole, locationId]);

  const filteredMembers = useMemo(() => {
    if (userRole === "employee") return scopedMembers;

    // admin filter
    if (filterLocation === "all") return scopedMembers;
    const locId = Number(filterLocation);
    return scopedMembers.filter((m) => m.locationId === locId);
  }, [scopedMembers, userRole, filterLocation]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Members Management
          </h2>
          <p className="text-slate-500 mt-1">
            {userRole === "admin"
              ? "Manage members across all locations"
              : "Manage members for your location"}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          </DialogTrigger>

          <DialogContent className="p-8">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Edit Member" : "Add New Member"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="p-1" htmlFor="firstName">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, firstName: e.target.value }))
                    }
                    placeholder="e.g., Sarah"
                    required
                  />
                </div>

                <div>
                  <Label className="p-1" htmlFor="lastName">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, lastName: e.target.value }))
                    }
                    placeholder="e.g., Johnson"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="p-1" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="e.g., sarah@example.com"
                  required
                />
              </div>

              <div>
                <Label className="p-1" htmlFor="phone">
                  Phone (optional)
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="e.g., +381 60 123 4567"
                />
              </div>

              <div>
                <Label className="p-1" htmlFor="dob">
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, dateOfBirth: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Location: admin can choose; employee fixed */}
              {userRole === "admin" ? (
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
              ) : (
                <div className="rounded-lg border border-slate-200 p-3 text-sm text-slate-600">
                  Location is fixed to your assigned gym.
                </div>
              )}

              {/* Password: create only */}
              {!editingMember && (
                <div>
                  <Label className="p-1" htmlFor="password">
                    Temporary Password (optional)
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, password: e.target.value }))
                    }
                    placeholder="Add password for member login"
                  />
                </div>
              )}

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
                  {isSaving ? "Saving..." : editingMember ? "Update" : "Create"}{" "}
                  Member
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

      {userRole === "admin" && (
        <div className="mb-4">
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={String(loc.id)}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200">
        {isLoading ? (
          <div className="p-6 text-slate-500">Loading members...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Contact</TableHead>
                {userRole === "admin" && <TableHead>Location</TableHead>}
                <TableHead>Credits</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredMembers.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    {m.firstName} {m.lastName}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {m.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {m.phone || <span className="text-slate-400">—</span>}
                      </div>
                    </div>
                  </TableCell>

                  {userRole === "admin" && (
                    <TableCell className="text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {m.locationName}
                      </div>
                    </TableCell>
                  )}

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-400" />

                      <Badge
                        variant={m.totalCredits > 0 ? "default" : "secondary"}
                      >
                        {m.totalCredits} credits
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(m.dateOfBirth).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(m)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deletingId === m.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete member?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(m.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredMembers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={userRole === "admin" ? 6 : 5}
                    className="text-slate-500 py-10 text-center"
                  >
                    No members found.
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
