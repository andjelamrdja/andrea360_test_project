import { useEffect, useMemo, useState } from "react";

import { MapPin, Edit, Trash2, Plus } from "lucide-react";
import {
  createLocation,
  deleteLocation,
  getLocations,
  updateLocation,
  type LocationResponse,
} from "../../../../api/models/locations";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

type FormState = { name: string; address: string };

export function LocationsManagement() {
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<LocationResponse | null>(null);
  const [formData, setFormData] = useState<FormState>({
    name: "",
    address: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const dialogTitle = useMemo(
    () => (editingLocation ? "Edit Location" : "Add New Location"),
    [editingLocation]
  );

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load locations.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setEditingLocation(null);
    setFormData({ name: "", address: "" });
    setIsDialogOpen(true);
  }

  function openEdit(location: LocationResponse) {
    setEditingLocation(location);
    setFormData({ name: location.name, address: location.address });
    setIsDialogOpen(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (editingLocation) {
        const updated = await updateLocation(editingLocation.id, formData);
        setLocations((prev) =>
          prev.map((l) => (l.id === updated.id ? updated : l))
        );
      } else {
        const created = await createLocation(formData);
        setLocations((prev) => [created, ...prev]);
      }

      setIsDialogOpen(false);
      setEditingLocation(null);
      setFormData({ name: "", address: "" });
    } catch (e: any) {
      // common: 409 unique constraint, 400 validation, 401/403 auth
      setError(
        e?.response?.data?.message ??
          "Save failed. Check inputs and permissions."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function onDelete(id: number) {
    // optional: confirm - minimal version
    const ok = window.confirm("Delete this location?");
    if (!ok) return;

    setDeletingId(id);
    setError(null);

    // optimistic remove
    const snapshot = locations;
    setLocations((prev) => prev.filter((l) => l.id !== id));

    try {
      await deleteLocation(id);
    } catch (e: any) {
      setLocations(snapshot);
      setError(e?.response?.data?.message ?? "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Locations Management
          </h2>
          <p className="text-slate-500 mt-1">
            Manage your fitness center locations
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Location
            </Button>
          </DialogTrigger>

          <DialogContent className="p-8">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>

            <form onSubmit={onSubmit} className="space-y-4 mt-4">
              <div>
                <Label className="pb-3" htmlFor="name">
                  Location Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g., Downtown Fitness Center"
                  required
                />
              </div>

              <div>
                <Label className="pb-3" htmlFor="address">
                  Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="e.g., 123 Main St, Belgrade"
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
                    : editingLocation
                    ? "Update"
                    : "Create"}{" "}
                  Location
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
        <div className="text-slate-500">Loading locations...</div>
      ) : locations.length === 0 ? (
        <div className="text-slate-500">
          No locations yet. Add your first location.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <Card
              key={location.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {location.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {location.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEdit(location)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(location.id)}
                    disabled={deletingId === location.id}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
