import { useEffect, useMemo, useState } from "react";

import { CreditCard, Check } from "lucide-react";
import { getActiveFitnessServices } from "../../../../api/models/fitness-services";
import { getMyCredits } from "../../../../api/models/member-credits";
import { createPayment } from "../../../../api/models/payments";
import { Alert, AlertDescription } from "../../ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

type FitnessServiceDto = {
  id: number;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  active: boolean;
  locationId?: number;
  locationName?: string;
};

export function PurchaseServices({ memberId }: { memberId: number }) {
  const [services, setServices] = useState<FitnessServiceDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [qtyByService, setQtyByService] = useState<Record<number, number>>({});
  const [busyServiceId, setBusyServiceId] = useState<number | null>(null);

  const [credits, setCredits] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const [svc, cr] = await Promise.all([
          getActiveFitnessServices(),
          getMyCredits(memberId),
        ]);
        setServices(svc);
        setCredits(cr);
      } finally {
        setLoading(false);
      }
    })();
  }, [memberId]);

  const sortedServices = useMemo(
    () => [...services].sort((a, b) => a.name.localeCompare(b.name)),
    [services]
  );

  const handleQtyChange = (serviceId: number, val: string) => {
    const n = Number(val);
    setQtyByService((prev) => ({
      ...prev,
      [serviceId]: Number.isFinite(n) ? Math.max(1, Math.min(100, n)) : 1,
    }));
  };

  const handlePurchase = async (svc: FitnessServiceDto) => {
    const qty = qtyByService[svc.id] ?? 1;

    setBusyServiceId(svc.id);
    try {
      await createPayment({
        memberId,
        fitnessServiceId: svc.id,
        quantity: qty,
        currency: "EUR",
      });

      const cr = await getMyCredits(memberId);
      setCredits(cr);
    } finally {
      setBusyServiceId(null);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Purchase Credits</h2>
        <p className="text-slate-500 mt-1">
          Choose a service and how many credits you want to buy.
        </p>
      </div>

      <Alert className="mb-8 bg-blue-50 border-blue-200">
        <CreditCard className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Test mode:</strong> purchase will be marked as <b>PAID</b> and
          credits will be added instantly.
        </AlertDescription>
      </Alert>

      {credits && (
        <Card className="mb-10">
          <CardHeader>
            <CardTitle>Your credits</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-700">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Total</Badge>
              <span className="font-semibold">
                {credits.total ?? credits.totalCredits ?? "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedServices.map((svc) => {
          const qty = qtyByService[svc.id] ?? 1;
          const total = Number(svc.price) * qty;

          return (
            <Card key={svc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xl">{svc.name}</div>
                    <div className="text-sm text-slate-500 mt-1">
                      {svc.durationMinutes} min • €
                      {Number(svc.price).toFixed(2)} per credit
                    </div>
                    {svc.description && (
                      <div className="text-sm text-slate-600 mt-2">
                        {svc.description}
                      </div>
                    )}
                  </div>
                  <Badge className="bg-slate-900 text-white">Active</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`qty-${svc.id}`}>Credits to buy</Label>
                  <Input
                    id={`qty-${svc.id}`}
                    type="number"
                    min={1}
                    max={100}
                    value={qty}
                    onChange={(e) => handleQtyChange(svc.id, e.target.value)}
                  />
                </div>

                <div className="rounded-lg bg-slate-50 p-4 flex items-center justify-between">
                  <div className="text-sm text-slate-600 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>
                      {qty} credit{qty === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500">Total</div>
                    <div className="text-2xl font-bold text-slate-900">
                      €{total.toFixed(2)}
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handlePurchase(svc)}
                  disabled={busyServiceId === svc.id}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {busyServiceId === svc.id ? "Processing..." : "Buy credits"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
