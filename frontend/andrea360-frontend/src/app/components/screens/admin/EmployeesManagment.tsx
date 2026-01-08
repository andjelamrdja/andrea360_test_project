import { useEffect, useMemo, useState } from "react";

import { Edit, Trash2, Plus, Mail, MapPin } from "lucide-react";
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
  type EmployeeAuthRole,
  type EmployeeResponse,
} from "../../../../api/models/employees";
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
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
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
import { Badge } from "../../ui/badge";
import { Label } from "../../ui/label";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  authRole: EmployeeAuthRole;
  role: string;
  locationId: string;
  password: string;
};

export function EmployeesManagement() {
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [locations, setLocations] = useState<LocationResponse[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<EmployeeResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [filterLocation, setFilterLocation] = useState<string>("all");

  const [formData, setFormData] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    authRole: "EMPLOYEE",
    role: "",
    locationId: "",
    password: "",
  });

  const dialogTitle = useMemo(
    () => (editingEmployee ? "Edit Employee" : "Add New Employee"),
    [editingEmployee]
  );

  async function load() {
    setIsLoading(true);
    setError(null);

    try {
      const [emps, locs] = await Promise.all([getEmployees(), getLocations()]);
      setEmployees(emps);
      setLocations(locs);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ?? "Failed to load employees/locations."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleAddNew() {
    setEditingEmployee(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      authRole: "EMPLOYEE",
      role: "",
      locationId: "",
      password: "",
    });
    setIsDialogOpen(true);
  }

  function handleEdit(employee: EmployeeResponse) {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone ?? "",
      authRole: "EMPLOYEE",
      role: employee.role ?? "",
      locationId: String(employee.locationId),
      password: "",
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const locationIdNum = Number(formData.locationId);
    if (!locationIdNum || Number.isNaN(locationIdNum)) {
      setIsSaving(false);
      setError("Please select a location.");
      return;
    }

    try {
      if (editingEmployee) {
        const updated = await updateEmployee(editingEmployee.id, {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          role: formData.role.trim(),
          locationId: locationIdNum,
        });

        setEmployees((prev) =>
          prev.map((e) => (e.id === updated.id ? updated : e))
        );
      } else {
        const created = await createEmployee({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          password: formData.password.trim() || undefined,
          authRole: formData.authRole,
          locationId: locationIdNum,
        });

        setEmployees((prev) => [created, ...prev]);
      }

      setIsDialogOpen(false);
      setEditingEmployee(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        authRole: "EMPLOYEE",
        role: "",
        locationId: "",
        password: "",
      });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const ok = window.confirm("Delete this employee?");
    if (!ok) return;

    setDeletingId(id);
    setError(null);

    const snapshot = employees;
    setEmployees((prev) => prev.filter((e) => e.id !== id));

    try {
      await deleteEmployee(id);
    } catch (e: any) {
      setEmployees(snapshot);
      setError(e?.response?.data?.message ?? "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredEmployees = useMemo(() => {
    if (filterLocation === "all") return employees;
    const locId = Number(filterLocation);
    return employees.filter((e) => e.locationId === locId);
  }, [employees, filterLocation]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Employees Management
          </h2>
          <p className="text-slate-500 mt-1">
            Manage staff members across all locations
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Employee
            </Button>
          </DialogTrigger>

          <DialogContent className="p-8">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
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
                    placeholder="e.g., John"
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
                    placeholder="e.g., Doe"
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
                  placeholder="e.g., john@fitcore.com"
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
                  placeholder="e.g., +381 64 123 456"
                />
              </div>

              <div>
                <Label className="p-1" htmlFor="jobRole">
                  Job Role
                </Label>
                <Input
                  id="jobRole"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, role: e.target.value }))
                  }
                  placeholder="e.g., CrossFit Trainer"
                  required={!!editingEmployee}
                />
                {}
              </div>

              <div>
                <Label className="p-1" htmlFor="authRole">
                  Authorization Role
                </Label>
                <Select
                  value={formData.authRole}
                  onValueChange={(value: EmployeeAuthRole) =>
                    setFormData((p) => ({ ...p, authRole: value }))
                  }
                  disabled={!!editingEmployee}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {editingEmployee && (
                  <p className="text-xs text-slate-500 mt-1">
                    Auth role change isn’t supported by your backend update DTO
                    (yet).
                  </p>
                )}
              </div>

              {!editingEmployee && (
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
                    placeholder="Leave empty to auto-generate a password"
                  />
                </div>
              )}

              <div>
                <Label className="p-1" htmlFor="location">
                  Location
                </Label>
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
                    : editingEmployee
                    ? "Update"
                    : "Create"}{" "}
                  Employee
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

      <div className="bg-white rounded-lg border border-slate-200">
        {isLoading ? (
          <div className="p-6 text-slate-500">Loading employees...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Job Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    {employee.firstName} {employee.lastName}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {employee.email}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">{employee.role}</Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {employee.locationName}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(employee.id)}
                        disabled={deletingId === employee.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-slate-500 py-10 text-center"
                  >
                    No employees found.
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
