"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Loader2,
  AlertTriangle,
  Droplets,
  Flame,
  ThermometerSun,
  Zap,
  FileText,
  Calendar,
  Euro,
  CheckCircle,
  Clock,
  Send,
  Eye,
} from "lucide-react";

// Types
interface UtilityBill {
  id: string;
  utilityType: string;
  periodStart: string;
  periodEnd: string;
  totalConsumption: string | null;
  totalAmount: string;
  unit: string;
  invoiceNumber: string | null;

interface Condominium {
  id: string;
  name: string;
  coldWaterBilling: string;
  hotWaterBilling: string;
  heatingBilling: string;
  gasBilling: string;
  electricityCommonBilling: string;
}
  supplierName: string | null;
  status: "draft" | "validated" | "distributed";
  createdAt: string;
}

interface LotMeter {
  meter: {
    id: string;
    meterType: string;
    meterNumber: string | null;
    lastReadingValue: string | null;
    lastReadingValueOffPeak: string | null;
    isDualTariff: boolean;
  };
  lot: {
    id: string;
    reference: string;
    type: string;
  };
}

// Config
const utilityTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string; unit: string }> = {
  cold_water: { label: "Eau froide", icon: <Droplets className="h-4 w-4" />, color: "bg-blue-500/10 text-blue-600", unit: "m3" },
  hot_water: { label: "Eau chaude", icon: <ThermometerSun className="h-4 w-4" />, color: "bg-orange-500/10 text-orange-600", unit: "m3" },
  heating: { label: "Chauffage", icon: <Flame className="h-4 w-4" />, color: "bg-red-500/10 text-red-600", unit: "kwh" },
  gas: { label: "Gaz", icon: <Flame className="h-4 w-4" />, color: "bg-amber-500/10 text-amber-600", unit: "kwh" },
  electricity_common: { label: "Électricité communs", icon: <Zap className="h-4 w-4" />, color: "bg-yellow-500/10 text-yellow-600", unit: "kwh" },
  fuel_oil: { label: "Fioul", icon: <Flame className="h-4 w-4" />, color: "bg-gray-500/10 text-gray-600", unit: "liters" },
};

const UTILITY_TYPES = [
  { value: "cold_water", label: "Eau froide" },
  { value: "hot_water", label: "Eau chaude" },
  { value: "heating", label: "Chauffage" },
  { value: "gas", label: "Gaz" },
  { value: "electricity_common", label: "Électricité communs" },
  { value: "fuel_oil", label: "Fioul" },
];

const UNIT_LABELS: Record<string, string> = {
  m3: "m³",
  kwh: "kWh",
  liters: "L",
  units: "unités",
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  draft: { label: "Brouillon", icon: <Clock className="h-3 w-3" />, color: "bg-gray-500/10 text-gray-600" },
  validated: { label: "Validée", icon: <CheckCircle className="h-3 w-3" />, color: "bg-green-500/10 text-green-600" },
  distributed: { label: "Distribuée", icon: <Send className="h-3 w-3" />, color: "bg-blue-500/10 text-blue-600" },
};

export default function UtilitiesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: condoId } = use(params);
  const [bills, setBills] = useState<UtilityBill[]>([]);
  const [condominium, setCondominium] = useState<Condominium | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create bill modal
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newBill, setNewBill] = useState({
    utilityType: "",
    periodStart: "",
    periodEnd: "",
    globalIndexStart: "",
    globalIndexEnd: "",
    totalAmount: "",
    invoiceNumber: "",
    supplierName: "",
  });

  // Detail modal
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState<UtilityBill | null>(null);
  const [billMeters, setBillMeters] = useState<LotMeter[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [readings, setReadings] = useState<Record<string, { current: string; previous: string }>>({});
  const [isSavingReadings, setIsSavingReadings] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/utilities/bills/condominium/${condoId}`);
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setBills(data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des factures");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCondominium = async () => {
    try {
      const response = await fetch(`/api/condominiums/${condoId}`);
      if (response.ok) {
        const data = await response.json();
        setCondominium(data);
      }
    } catch (err) {
      console.error("Error fetching condominium:", err);
    }
  };

  // Filtrer les types de consommation selon la config de la copro
  const getAvailableUtilityTypes = () => {
    if (!condominium) return [];
    
    const billingConfig: Record<string, string> = {
      cold_water: condominium.coldWaterBilling,
      hot_water: condominium.hotWaterBilling,
      heating: condominium.heatingBilling,
      gas: condominium.gasBilling,
      electricity_common: condominium.electricityCommonBilling,
    };

    return UTILITY_TYPES.filter(type => billingConfig[type.value] && billingConfig[type.value] !== 'none');
  };

  const availableUtilityTypes = getAvailableUtilityTypes();

  useEffect(() => {
    fetchBills();
    fetchCondominium();
  }, [condoId]);

  const handleCreateBill = async () => {
    if (!newBill.utilityType || !newBill.periodStart || !newBill.periodEnd || !newBill.totalAmount) return;

    setIsCreating(true);
    try {
      const unit = utilityTypeConfig[newBill.utilityType]?.unit || "m3";
      const totalConsumption = newBill.globalIndexEnd && newBill.globalIndexStart
        ? parseFloat(newBill.globalIndexEnd) - parseFloat(newBill.globalIndexStart)
        : null;

      const response = await fetch(`/api/utilities/bills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          condominiumId: condoId,
          utilityType: newBill.utilityType,
          periodStart: newBill.periodStart,
          periodEnd: newBill.periodEnd,
          globalIndexStart: newBill.globalIndexStart ? parseFloat(newBill.globalIndexStart) : null,
          globalIndexEnd: newBill.globalIndexEnd ? parseFloat(newBill.globalIndexEnd) : null,
          totalConsumption,
          totalAmount: parseFloat(newBill.totalAmount),
          unit,
          invoiceNumber: newBill.invoiceNumber || null,
          supplierName: newBill.supplierName || null,
        }),
      });

      if (response.ok) {
        const created = await response.json();
        setShowCreateDialog(false);
        setNewBill({
          utilityType: "cold_water",
          periodStart: "",
          periodEnd: "",
          globalIndexStart: "",
          globalIndexEnd: "",
          totalAmount: "",
          invoiceNumber: "",
          supplierName: "",
        });
        // Initialize readings for the new bill
        await fetch(`/api/utilities/bills/${created.id}/initialize-readings`, { method: "POST" });
        fetchBills();
        openDetailDialog(created);
      }
    } catch (error) {
      console.error("Error creating bill:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const openDetailDialog = async (bill: UtilityBill) => {
    setSelectedBill(bill);
    setShowDetailDialog(true);
    setLoadingDetail(true);

    try {
      // Fetch meters for this utility type
      const metersResponse = await fetch(`/api/utilities/meters/condominium/${condoId}?type=${bill.utilityType}`);
      if (metersResponse.ok) {
        const metersData = await metersResponse.json();
        setBillMeters(metersData);

        // Fetch existing readings
        const readingsResponse = await fetch(`/api/utilities/readings/${bill.id}`);
        if (readingsResponse.ok) {
          const readingsData = await readingsResponse.json();
          const readingsMap: Record<string, { current: string; previous: string }> = {};
          for (const r of readingsData) {
            readingsMap[r.meter.id] = {
              previous: r.reading.previousIndex || "0",
              current: r.reading.currentIndex || "0",
            };
          }
          // Initialize missing readings from meters
          for (const m of metersData) {
            if (!readingsMap[m.meter.id]) {
              readingsMap[m.meter.id] = {
                previous: m.meter.lastReadingValue || "0",
                current: m.meter.lastReadingValue || "0",
              };
            }
          }
          setReadings(readingsMap);
        }
      }
    } catch (error) {
      console.error("Error fetching bill details:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSaveReadings = async () => {
    if (!selectedBill) return;

    setIsSavingReadings(true);
    try {
      const readingsData = billMeters.map((m) => ({
        lotMeterId: m.meter.id,
        previousIndex: parseFloat(readings[m.meter.id]?.previous || "0"),
        currentIndex: parseFloat(readings[m.meter.id]?.current || "0"),
      }));

      await fetch(`/api/utilities/readings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utilityBillId: selectedBill.id,
          readings: readingsData,
        }),
      });

      fetchBills();
    } catch (error) {
      console.error("Error saving readings:", error);
    } finally {
      setIsSavingReadings(false);
    }
  };

  const handleValidate = async () => {
    if (!selectedBill) return;

    setIsValidating(true);
    try {
      const response = await fetch(`/api/utilities/bills/${selectedBill.id}/validate`, {
        method: "POST",
      });

      if (response.ok) {
        const updated = await response.json();
        setSelectedBill(updated);
        fetchBills();
      } else {
        const error = await response.json();
        alert(error.message || "Erreur lors de la validation");
      }
    } catch (error) {
      console.error("Error validating bill:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDistribute = async () => {
    if (!selectedBill) return;

    setIsDistributing(true);
    try {
      const response = await fetch(`/api/utilities/bills/${selectedBill.id}/distribute`, {
        method: "POST",
      });

      if (response.ok) {
        const updated = await response.json();
        setSelectedBill(updated);
        fetchBills();
      } else {
        const error = await response.json();
        alert(error.message || "Erreur lors de la distribution");
      }
    } catch (error) {
      console.error("Error distributing bill:", error);
    } finally {
      setIsDistributing(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchBills}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/app/condominiums/${condoId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Consommations</h1>
            <p className="text-muted-foreground">
              Gérez les factures et relevés de consommation
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle facture
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{bills.length}</p>
                <p className="text-sm text-muted-foreground">Total factures</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-500/10">
                <Clock className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{bills.filter((b) => b.status === "draft").length}</p>
                <p className="text-sm text-muted-foreground">Brouillons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{bills.filter((b) => b.status === "validated").length}</p>
                <p className="text-sm text-muted-foreground">Validées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <Send className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{bills.filter((b) => b.status === "distributed").length}</p>
                <p className="text-sm text-muted-foreground">Distribuées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/50 hover:bg-muted/50">
              <TableHead className="h-10 px-4 font-medium">Type</TableHead>
              <TableHead className="h-10 px-4 font-medium">Période</TableHead>
              <TableHead className="h-10 px-4 text-right font-medium">Consommation</TableHead>
              <TableHead className="h-10 px-4 text-right font-medium">Montant</TableHead>
              <TableHead className="h-10 px-4 font-medium">Fournisseur</TableHead>
              <TableHead className="h-10 px-4 font-medium">Statut</TableHead>
              <TableHead className="h-10 w-20 px-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-10 w-10 text-muted-foreground/50" />
                    <p className="font-medium">Aucune facture</p>
                    <p className="text-sm">Créez votre première facture de consommation</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              bills.map((bill) => {
                const typeConfig = utilityTypeConfig[bill.utilityType] || utilityTypeConfig.cold_water;
                const status = statusConfig[bill.status] || statusConfig.draft;
                return (
                  <TableRow key={bill.id} className="group border-b transition-colors hover:bg-muted/50">
                    <TableCell className="h-12 px-4">
                      <Badge variant="outline" className={`gap-1.5 ${typeConfig.color}`}>
                        {typeConfig.icon}
                        {typeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="h-12 px-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDate(bill.periodStart)} - {formatDate(bill.periodEnd)}
                      </div>
                    </TableCell>
                    <TableCell className="h-12 px-4 text-right tabular-nums">
                      {bill.totalConsumption
                        ? `${parseFloat(bill.totalConsumption).toLocaleString("fr-FR")} ${UNIT_LABELS[bill.unit] || bill.unit}`
                        : "-"}
                    </TableCell>
                    <TableCell className="h-12 px-4 text-right tabular-nums font-medium">
                      {formatAmount(bill.totalAmount)}
                    </TableCell>
                    <TableCell className="h-12 px-4 text-sm text-muted-foreground">
                      {bill.supplierName || "-"}
                    </TableCell>
                    <TableCell className="h-12 px-4">
                      <Badge variant="outline" className={`gap-1 ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="h-12 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetailDialog(bill)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Bill Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nouvelle facture fournisseur</DialogTitle>
            <DialogDescription>
              Créez une facture de consommation à répartir entre les copropriétaires.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type *</Label>
              <Select
                value={newBill.utilityType}
                onValueChange={(value) => setNewBill({ ...newBill, utilityType: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {availableUtilityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Début *</Label>
              <Input
                type="date"
                value={newBill.periodStart}
                onChange={(e) => setNewBill({ ...newBill, periodStart: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Fin *</Label>
              <Input
                type="date"
                value={newBill.periodEnd}
                onChange={(e) => setNewBill({ ...newBill, periodEnd: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Index début</Label>
              <Input
                type="number"
                step="0.001"
                value={newBill.globalIndexStart}
                onChange={(e) => setNewBill({ ...newBill, globalIndexStart: e.target.value })}
                className="col-span-3"
                placeholder="Index compteur général"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Index fin</Label>
              <Input
                type="number"
                step="0.001"
                value={newBill.globalIndexEnd}
                onChange={(e) => setNewBill({ ...newBill, globalIndexEnd: e.target.value })}
                className="col-span-3"
                placeholder="Index compteur général"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Montant *</Label>
              <div className="col-span-3 relative">
                <Input
                  type="number"
                  step="0.01"
                  value={newBill.totalAmount}
                  onChange={(e) => setNewBill({ ...newBill, totalAmount: e.target.value })}
                  className="pr-8"
                  placeholder="0.00"
                />
                <Euro className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">N° facture</Label>
              <Input
                value={newBill.invoiceNumber}
                onChange={(e) => setNewBill({ ...newBill, invoiceNumber: e.target.value })}
                className="col-span-3"
                placeholder="Optionnel"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Fournisseur</Label>
              <Input
                value={newBill.supplierName}
                onChange={(e) => setNewBill({ ...newBill, supplierName: e.target.value })}
                className="col-span-3"
                placeholder="Ex: Veolia, EDF..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isCreating}>
              Annuler
            </Button>
            <Button
              onClick={handleCreateBill}
              disabled={!newBill.utilityType || !newBill.periodStart || !newBill.periodEnd || !newBill.totalAmount || isCreating}
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bill Detail / Readings Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedBill && utilityTypeConfig[selectedBill.utilityType]?.icon}
              Facture {selectedBill && utilityTypeConfig[selectedBill.utilityType]?.label}
            </DialogTitle>
            <DialogDescription>
              {selectedBill && `${formatDate(selectedBill.periodStart)} - ${formatDate(selectedBill.periodEnd)}`}
              {selectedBill && ` • ${formatAmount(selectedBill.totalAmount)}`}
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {/* Status banner */}
              {selectedBill && (
                <div className={`flex items-center gap-2 rounded-lg p-3 ${statusConfig[selectedBill.status]?.color}`}>
                  {statusConfig[selectedBill.status]?.icon}
                  <span className="font-medium">{statusConfig[selectedBill.status]?.label}</span>
                  {selectedBill.status === "draft" && (
                    <span className="text-sm ml-2">— Saisissez les relevés puis validez</span>
                  )}
                  {selectedBill.status === "validated" && (
                    <span className="text-sm ml-2">— Prêt pour distribution</span>
                  )}
                </div>
              )}

              {/* Meters / Readings table */}
              {billMeters.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Aucun compteur configuré pour ce type</p>
                  <p className="text-sm">Ajoutez des compteurs aux lots depuis la page Lots</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-medium">Lot</TableHead>
                        <TableHead className="font-medium">Compteur</TableHead>
                        <TableHead className="text-right font-medium">Ancien index</TableHead>
                        <TableHead className="text-right font-medium">Nouvel index</TableHead>
                        <TableHead className="text-right font-medium">Conso.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billMeters.map((m) => {
                        const reading = readings[m.meter.id] || { previous: "0", current: "0" };
                        const consumption = parseFloat(reading.current) - parseFloat(reading.previous);
                        const isEditable = selectedBill?.status === "draft";
                        return (
                          <TableRow key={m.meter.id}>
                            <TableCell className="font-medium">{m.lot.reference}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {m.meter.meterNumber || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                step="0.001"
                                value={reading.previous}
                                onChange={(e) =>
                                  setReadings({
                                    ...readings,
                                    [m.meter.id]: { ...reading, previous: e.target.value },
                                  })
                                }
                                className="w-28 text-right ml-auto"
                                disabled={!isEditable}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                step="0.001"
                                value={reading.current}
                                onChange={(e) =>
                                  setReadings({
                                    ...readings,
                                    [m.meter.id]: { ...reading, current: e.target.value },
                                  })
                                }
                                className="w-28 text-right ml-auto"
                                disabled={!isEditable}
                              />
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-medium">
                              {consumption > 0 ? consumption.toFixed(3) : "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedBill?.status === "draft" && (
              <>
                <Button variant="outline" onClick={handleSaveReadings} disabled={isSavingReadings}>
                  {isSavingReadings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enregistrer
                </Button>
                <Button onClick={handleValidate} disabled={isValidating || billMeters.length === 0}>
                  {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Valider
                </Button>
              </>
            )}
            {selectedBill?.status === "validated" && (
              <Button onClick={handleDistribute} disabled={isDistributing}>
                {isDistributing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="mr-2 h-4 w-4" />
                Distribuer
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
