import { useEffect, useMemo, useState } from "react";
import { Dumbbell, Edit, Trash2, Plus, Euro } from "lucide-react";

import {
  createFitnessService,
  deleteFitnessService,
  getFitnessServices,
  updateFitnessService,
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
import { Switch } from "../../ui/switch";
import { Textarea } from "../../ui/textarea";

type FormState = {
  name: string;
  price: string; // keep as string in form; convert on submit
  durationMinutes: string;
  description: string;
  active: boolean;
};

export function FitnessServicesManagement() {
  const [services, setServices] = useState<FitnessServiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] =
    useState<FitnessServiceResponse | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showInactive, setShowInactive] = useState(true);

  const [formData, setFormData] = useState<FormState>({
    name: "",
    price: "",
    durationMinutes: "",
    description: "",
    active: true,
  });

  const dialogTitle = useMemo(
    () => (editingService ? "Edit Service" : "Add New Service"),
    [editingService]
  );

  async function load() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getFitnessServices();
      setServices(data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load services.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setFormData({
      name: "",
      price: "",
      durationMinutes: "",
      description: "",
      active: true,
    });
  }

  function handleAddNew() {
    setEditingService(null);
    resetForm();
    setIsDialogOpen(true);
  }

  function handleEdit(service: FitnessServiceResponse) {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: String(service.price),
      durationMinutes: String(service.durationMinutes),
      description: service.description ?? "",
      active: service.active,
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const name = formData.name.trim();
    const description = formData.description.trim();
    const priceNum = Number(formData.price);
    const durationNum = Number(formData.durationMinutes);

    if (!name) {
      setIsSaving(false);
      setError("Name is required.");
      return;
    }
    if (!durationNum || Number.isNaN(durationNum) || durationNum < 1) {
      setIsSaving(false);
      setError("Duration must be a number >= 1.");
      return;
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setIsSaving(false);
      setError("Price must be a number >= 0.");
      return;
    }

    try {
      if (editingService) {
        // Update requires active
        const updated = await updateFitnessService(editingService.id, {
          name,
          description: description || undefined,
          durationMinutes: durationNum,
          price: priceNum,
          active: formData.active,
        });

        setServices((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
      } else {
        // Create: active optional
        const created = await createFitnessService({
          name,
          description: description || undefined,
          durationMinutes: durationNum,
          price: priceNum,
          active: formData.active,
        });

        setServices((prev) => [created, ...prev]);
      }

      setIsDialogOpen(false);
      setEditingService(null);
      resetForm();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const ok = window.confirm("Delete this service?");
    if (!ok) return;

    setDeletingId(id);
    setError(null);

    const snapshot = services;
    setServices((prev) => prev.filter((s) => s.id !== id));

    try {
      await deleteFitnessService(id);
    } catch (e: any) {
      setServices(snapshot);
      setError(e?.response?.data?.message ?? "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredServices = useMemo(() => {
    if (showInactive) return services;
    return services.filter((s) => s.active);
  }, [services, showInactive]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Services Management
          </h2>
          <p className="text-slate-500 mt-1">
            Create, edit, activate/deactivate and manage your fitness services.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Switch checked={showInactive} onCheckedChange={setShowInactive} />
            <span>Show inactive</span>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Service
              </Button>
            </DialogTrigger>

            <DialogContent className="p-8">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label className="p-1" htmlFor="name">
                    Service Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g., CrossFit Training"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="p-1" htmlFor="price">
                      Price (EUR)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, price: e.target.value }))
                      }
                      placeholder="e.g., 25.00"
                      required
                    />
                  </div>

                  <div>
                    <Label className="p-1" htmlFor="duration">
                      Duration (minutes)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      step="1"
                      min={1}
                      value={formData.durationMinutes}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          durationMinutes: e.target.value,
                        }))
                      }
                      placeholder="e.g., 60"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="p-1" htmlFor="description">
                    Description (optional)
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Brief description of the service"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Active</p>
                    <p className="text-xs text-slate-500">
                      Inactive services can be hidden from booking flows.
                    </p>
                  </div>
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      setFormData((p) => ({ ...p, active: checked }))
                    }
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
                      : editingService
                      ? "Update"
                      : "Create"}{" "}
                    Service
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-slate-500">Loading services...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="rounded-xl border border-slate-200 bg-white hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="w-6 h-6 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {service.name}
                        </h3>
                        {!service.active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>

                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {service.description || "No description."}
                      </p>

                      <p className="text-xs text-slate-500 mt-2">
                        Duration:{" "}
                        <span className="font-medium text-slate-700">
                          {service.durationMinutes} min
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Euro className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-bold text-slate-900">
                      {Number(service.price).toFixed(2)}
                    </span>
                  </div>

                  <Badge variant="secondary">
                    {service.active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(service.id)}
                    disabled={deletingId === service.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredServices.length === 0 && (
            <div className="col-span-full rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500">
              No services found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
