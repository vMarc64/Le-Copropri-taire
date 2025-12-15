"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  DoorOpen,
  Home,
  Car,
  Warehouse,
  Store,
  Plus,
  Search,
  MoreVertical,
  User,
  Edit,
  Loader2,
  AlertTriangle,
  Building2,
  Box,
  Trash2,
  UserX,
  Droplets,
  Flame,
  ThermometerSun,
  Gauge,
} from "lucide-react";

interface Lot {
  id: string;
  reference: string;
  type: string;
  floor: number | null;
  surface: number | null;
  tantiemes: number | null;
  owner: { id: string; name: string } | null;
  createdAt: string;
}

interface Owner {
  id: string;
  name: string;
  email: string;
}

interface LotMeter {
  id: string;
  lotId: string;
  meterType: 'cold_water' | 'hot_water' | 'heating';
  meterNumber: string | null;
  isDualTariff: boolean;
  isActive: boolean;
  lastReadingValue: string | null;
  lastReadingDate: string | null;
}

const meterTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  cold_water: { label: "Eau froide", icon: <Droplets className="h-4 w-4" />, color: "bg-blue-500/10 text-blue-600" },
  hot_water: { label: "Eau chaude", icon: <ThermometerSun className="h-4 w-4" />, color: "bg-orange-500/10 text-orange-600" },
  heating: { label: "Chauffage", icon: <Flame className="h-4 w-4" />, color: "bg-red-500/10 text-red-600" },
};

const METER_TYPES = [
  { value: "cold_water", label: "Eau froide" },
  { value: "hot_water", label: "Eau chaude" },
  { value: "heating", label: "Chauffage" },
];

const lotTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  appartement: { label: "Appartement", icon: <Home className="h-4 w-4" />, color: "bg-blue-500/10 text-blue-600" },
  parking: { label: "Parking", icon: <Car className="h-4 w-4" />, color: "bg-purple-500/10 text-purple-600" },
  cave: { label: "Cave", icon: <Warehouse className="h-4 w-4" />, color: "bg-amber-500/10 text-amber-600" },
  commerce: { label: "Commerce", icon: <Store className="h-4 w-4" />, color: "bg-emerald-500/10 text-emerald-600" },
  bureau: { label: "Bureau", icon: <Building2 className="h-4 w-4" />, color: "bg-cyan-500/10 text-cyan-600" },
  box: { label: "Box", icon: <Box className="h-4 w-4" />, color: "bg-gray-500/10 text-gray-600" },
  autre: { label: "Autre", icon: <DoorOpen className="h-4 w-4" />, color: "bg-slate-500/10 text-slate-600" },
};

const LOT_TYPES = [
  { value: "appartement", label: "Appartement" },
  { value: "parking", label: "Parking" },
  { value: "cave", label: "Cave" },
  { value: "commerce", label: "Commerce" },
  { value: "bureau", label: "Bureau" },
  { value: "box", label: "Box" },
  { value: "autre", label: "Autre" },
];

// Format tantiemes with dot separator (e.g., 1.234)
const formatTantiemes = (value: number): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function LotsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: condoId } = use(params);
  const [search, setSearch] = useState("");
  const [lots, setLots] = useState<Lot[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create lot modal state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newLot, setNewLot] = useState({
    reference: "",
    type: "appartement",
    floor: "",
    surface: "",
    tantiemes: "",
  });

  // Edit lot modal state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [editForm, setEditForm] = useState({
    type: "appartement",
    floor: "",
    surface: "",
    tantiemes: "",
  });

  // Assign lot modal state
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assigningLot, setAssigningLot] = useState<Lot | null>(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");

  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingLot, setDeletingLot] = useState<Lot | null>(null);

  // Meters modal state
  const [showMetersDialog, setShowMetersDialog] = useState(false);
  const [metersLot, setMetersLot] = useState<Lot | null>(null);
  const [meters, setMeters] = useState<LotMeter[]>([]);
  const [loadingMeters, setLoadingMeters] = useState(false);
  const [showAddMeterForm, setShowAddMeterForm] = useState(false);
  const [isAddingMeter, setIsAddingMeter] = useState(false);
  const [newMeter, setNewMeter] = useState({
    meterType: "cold_water",
    meterNumber: "",
  });

  const fetchLots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/condominiums/${condoId}/lots`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des lots");
      }
      const data = await response.json();
      setLots(data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des lots");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const response = await fetch(`/api/condominiums/${condoId}/owners`);
      if (response.ok) {
        const data = await response.json();
        setOwners(data);
      }
    } catch (err) {
      console.error("Error fetching owners:", err);
    }
  };

  useEffect(() => {
    fetchLots();
    fetchOwners();
  }, [condoId]);

  const handleCreateLot = async () => {
    if (!newLot.reference.trim() || !newLot.type) return;

    setIsCreating(true);
    try {
      const response = await fetch(`/api/condominiums/${condoId}/lots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: newLot.reference.trim(),
          type: newLot.type,
          floor: newLot.floor ? parseInt(newLot.floor) : undefined,
          surface: newLot.surface ? parseFloat(newLot.surface) : undefined,
          tantiemes: newLot.tantiemes ? parseFloat(newLot.tantiemes) : undefined,
        }),
      });

      if (response.ok) {
        setNewLot({
          reference: "",
          type: "appartement",
          floor: "",
          surface: "",
          tantiemes: "",
        });
        setShowCreateDialog(false);
        fetchLots();
      }
    } catch (error) {
      console.error("Error creating lot:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const openEditDialog = (lot: Lot) => {
    setEditingLot(lot);
    setEditForm({
      type: lot.type,
      floor: lot.floor?.toString() || "",
      surface: lot.surface?.toString() || "",
      tantiemes: lot.tantiemes?.toString() || "",
    });
    setShowEditDialog(true);
  };

  const handleEditLot = async () => {
    if (!editingLot) return;

    setIsEditing(true);
    try {
      const response = await fetch(`/api/lots/${editingLot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: editForm.type,
          floor: editForm.floor ? parseInt(editForm.floor) : null,
          surface: editForm.surface ? parseFloat(editForm.surface) : null,
          tantiemes: editForm.tantiemes ? parseFloat(editForm.tantiemes) : null,
        }),
      });

      if (response.ok) {
        setShowEditDialog(false);
        setEditingLot(null);
        fetchLots();
      }
    } catch (error) {
      console.error("Error updating lot:", error);
    } finally {
      setIsEditing(false);
    }
  };

  const openAssignDialog = (lot: Lot) => {
    setAssigningLot(lot);
    setSelectedOwnerId(lot.owner?.id || "");
    setShowAssignDialog(true);
  };

  const handleAssignLot = async () => {
    if (!assigningLot) return;

    setIsAssigning(true);
    try {
      const response = await fetch(`/api/lots/${assigningLot.id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: selectedOwnerId || null,
        }),
      });

      if (response.ok) {
        setShowAssignDialog(false);
        setAssigningLot(null);
        fetchLots();
      }
    } catch (error) {
      console.error("Error assigning lot:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const openDeleteDialog = (lot: Lot) => {
    setDeletingLot(lot);
    setShowDeleteDialog(true);
  };

  const handleDeleteLot = async () => {
    if (!deletingLot) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/lots/${deletingLot.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        setDeletingLot(null);
        fetchLots();
      }
    } catch (error) {
      console.error("Error deleting lot:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openMetersDialog = async (lot: Lot) => {
    setMetersLot(lot);
    setShowMetersDialog(true);
    setLoadingMeters(true);
    setShowAddMeterForm(false);
    
    try {
      const response = await fetch(`/api/utilities/meters/lot/${lot.id}`);
      if (response.ok) {
        const data = await response.json();
        setMeters(data);
      }
    } catch (error) {
      console.error("Error fetching meters:", error);
    } finally {
      setLoadingMeters(false);
    }
  };

  const handleAddMeter = async () => {
    if (!metersLot || !newMeter.meterType) return;

    setIsAddingMeter(true);
    try {
      const response = await fetch(`/api/utilities/meters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lotId: metersLot.id,
          meterType: newMeter.meterType,
          meterNumber: newMeter.meterNumber.trim() || null,
        }),
      });

      if (response.ok) {
        const created = await response.json();
        setMeters([...meters, created]);
        setNewMeter({ meterType: "cold_water", meterNumber: "" });
        setShowAddMeterForm(false);
      }
    } catch (error) {
      console.error("Error creating meter:", error);
    } finally {
      setIsAddingMeter(false);
    }
  };

  const handleDeleteMeter = async (meterId: string) => {
    try {
      const response = await fetch(`/api/utilities/meters/${meterId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMeters(meters.filter((m) => m.id !== meterId));
      }
    } catch (error) {
      console.error("Error deleting meter:", error);
    }
  };

  const filteredLots = lots.filter((lot) => {
    return (
      lot.reference.toLowerCase().includes(search.toLowerCase()) ||
      (lot.owner?.name.toLowerCase().includes(search.toLowerCase()) ?? false)
    );
  });

  const stats = {
    total: lots.length,
    apartments: lots.filter((l) => l.type === "appartement").length,
    parkings: lots.filter((l) => l.type === "parking").length,
    totalTantiemes: lots.reduce((sum, l) => sum + (l.tantiemes || 0), 0),
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
        <Button onClick={() => fetchLots()}>Réessayer</Button>
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
            <h1 className="text-3xl font-bold">Lots</h1>
            <p className="text-muted-foreground">
              Gérez les lots de la copropriété
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un lot
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <DoorOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total lots</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <Home className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.apartments}</p>
                <p className="text-sm text-muted-foreground">Appartements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                <Car className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.parkings}</p>
                <p className="text-sm text-muted-foreground">Parkings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                <span className="text-xl font-bold text-amber-500">‰</span>
              </div>
              <div>
                <p className="text-3xl font-bold">{formatTantiemes(stats.totalTantiemes)}</p>
                <p className="text-sm text-muted-foreground">Tantièmes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par référence ou propriétaire..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/50 hover:bg-muted/50">
              <TableHead className="h-10 px-4 font-medium">Référence</TableHead>
              <TableHead className="h-10 px-4 font-medium">Type</TableHead>
              <TableHead className="h-10 w-20 px-4 text-center font-medium">Étage</TableHead>
              <TableHead className="h-10 w-24 px-4 text-center font-medium">Surface</TableHead>
              <TableHead className="h-10 w-24 px-4 text-center font-medium">Tantièmes</TableHead>
              <TableHead className="h-10 px-4 font-medium">Propriétaire</TableHead>
              <TableHead className="h-10 w-10 px-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLots.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <DoorOpen className="h-10 w-10 text-muted-foreground/50" />
                    <p className="font-medium">Aucun lot</p>
                    <p className="text-sm">Ajoutez votre premier lot pour commencer</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLots.map((lot) => {
                const typeConfig = lotTypeConfig[lot.type] || lotTypeConfig.autre;
                return (
                  <TableRow
                    key={lot.id}
                    className="group border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="h-12 px-4 font-medium">
                      <button
                        onClick={() => openEditDialog(lot)}
                        className="hover:text-primary hover:underline text-left"
                      >
                        {lot.reference}
                      </button>
                    </TableCell>
                    <TableCell className="h-12 px-4">
                      <Badge variant="outline" className={`gap-1.5 ${typeConfig.color}`}>
                        {typeConfig.icon}
                        {typeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="h-12 px-4 text-center tabular-nums">
                      {lot.floor === null ? "-" : lot.floor === 0 ? "RDC" : lot.floor}
                    </TableCell>
                    <TableCell className="h-12 px-4 text-center tabular-nums">
                      {lot.surface ? `${lot.surface} m²` : "-"}
                    </TableCell>
                    <TableCell className="h-12 px-4 text-center tabular-nums">
                      {lot.tantiemes ? formatTantiemes(lot.tantiemes) : "-"}
                    </TableCell>
                    <TableCell className="h-12 px-4">
                      {lot.owner ? (
                        <span className="text-sm">
                          {lot.owner.name}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Non assigné</span>
                      )}
                    </TableCell>
                    <TableCell className="h-12 px-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
                          >
                            <span className="sr-only">Actions</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEditDialog(lot)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAssignDialog(lot)}>
                            <User className="mr-2 h-4 w-4" />
                            Assigner
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openMetersDialog(lot)}>
                            <Gauge className="mr-2 h-4 w-4" />
                            Compteurs
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(lot)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Lot Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Créer un lot</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau lot à cette copropriété.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference" className="text-right">
                Référence *
              </Label>
              <Input
                id="reference"
                value={newLot.reference}
                onChange={(e) => setNewLot({ ...newLot, reference: e.target.value })}
                className="col-span-3"
                placeholder="Ex: A12, B05"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type *
              </Label>
              <Select
                value={newLot.type}
                onValueChange={(value) => setNewLot({ ...newLot, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {LOT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="floor" className="text-right">
                Étage
              </Label>
              <Input
                id="floor"
                type="number"
                value={newLot.floor}
                onChange={(e) => setNewLot({ ...newLot, floor: e.target.value })}
                className="col-span-3"
                placeholder="Ex: 0, 1, -1"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="surface" className="text-right">
                Surface (m²)
              </Label>
              <Input
                id="surface"
                type="number"
                step="0.01"
                value={newLot.surface}
                onChange={(e) => setNewLot({ ...newLot, surface: e.target.value })}
                className="col-span-3"
                placeholder="Ex: 65.50"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tantiemes" className="text-right">
                Tantièmes
              </Label>
              <Input
                id="tantiemes"
                type="number"
                step="0.001"
                value={newLot.tantiemes}
                onChange={(e) => setNewLot({ ...newLot, tantiemes: e.target.value })}
                className="col-span-3"
                placeholder="Ex: 1.234"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={isCreating}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateLot}
              disabled={!newLot.reference.trim() || !newLot.type || isCreating}
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lot Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le lot {editingLot?.reference}</DialogTitle>
            <DialogDescription>
              Modifiez les informations du lot.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Type *
              </Label>
              <Select
                value={editForm.type}
                onValueChange={(value) => setEditForm({ ...editForm, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {LOT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-floor" className="text-right">
                Étage
              </Label>
              <Input
                id="edit-floor"
                type="number"
                value={editForm.floor}
                onChange={(e) => setEditForm({ ...editForm, floor: e.target.value })}
                className="col-span-3"
                placeholder="Ex: 0, 1, -1"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-surface" className="text-right">
                Surface (m²)
              </Label>
              <Input
                id="edit-surface"
                type="number"
                step="0.01"
                value={editForm.surface}
                onChange={(e) => setEditForm({ ...editForm, surface: e.target.value })}
                className="col-span-3"
                placeholder="Ex: 65.50"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-tantiemes" className="text-right">
                Tantièmes
              </Label>
              <Input
                id="edit-tantiemes"
                type="number"
                step="0.001"
                value={editForm.tantiemes}
                onChange={(e) => setEditForm({ ...editForm, tantiemes: e.target.value })}
                className="col-span-3"
                placeholder="Ex: 1.234"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isEditing}
            >
              Annuler
            </Button>
            <Button
              onClick={handleEditLot}
              disabled={!editForm.type || isEditing}
            >
              {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Lot Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assigner le lot {assigningLot?.reference}</DialogTitle>
            <DialogDescription>
              Sélectionnez un propriétaire pour ce lot.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={selectedOwnerId}
              onValueChange={setSelectedOwnerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un propriétaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UserX className="h-4 w-4" />
                    Aucun (retirer l'assignation)
                  </div>
                </SelectItem>
                {owners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {owner.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {owners.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground text-center">
                Aucun propriétaire dans cette copropriété.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
              disabled={isAssigning}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAssignLot}
              disabled={isAssigning}
            >
              {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assigner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le lot {deletingLot?.reference} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le lot sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLot}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Meters Dialog */}
      <Dialog open={showMetersDialog} onOpenChange={setShowMetersDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Compteurs du lot {metersLot?.reference}
            </DialogTitle>
            <DialogDescription>
              Gérez les compteurs (eau, chauffage) de ce lot.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {loadingMeters ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Liste des compteurs */}
                {meters.length === 0 && !showAddMeterForm ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Gauge className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Aucun compteur configuré</p>
                    <p className="text-sm">Ajoutez un compteur pour suivre les consommations</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {meters.map((meter) => {
                      const config = meterTypeConfig[meter.meterType] || meterTypeConfig.cold_water;
                      return (
                        <div
                          key={meter.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.color}`}>
                              {config.icon}
                            </div>
                            <div>
                              <p className="font-medium">{config.label}</p>
                              <p className="text-sm text-muted-foreground">
                                {meter.meterNumber ? `N° ${meter.meterNumber}` : "Sans numéro"}
                                {meter.lastReadingValue && (
                                  <span className="ml-2">
                                    • Dernier relevé: {meter.lastReadingValue}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteMeter(meter.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Formulaire d'ajout */}
                {showAddMeterForm ? (
                  <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                    <div className="space-y-2">
                      <Label>Type de compteur</Label>
                      <Select
                        value={newMeter.meterType}
                        onValueChange={(value) => setNewMeter({ ...newMeter, meterType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {METER_TYPES.filter(
                            (t) => !meters.some((m) => m.meterType === t.value)
                          ).map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Numéro de compteur (optionnel)</Label>
                      <Input
                        value={newMeter.meterNumber}
                        onChange={(e) => setNewMeter({ ...newMeter, meterNumber: e.target.value })}
                        placeholder="Ex: 123456789"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddMeterForm(false)}
                        disabled={isAddingMeter}
                      >
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddMeter}
                        disabled={isAddingMeter}
                      >
                        {isAddingMeter && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Ajouter
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowAddMeterForm(true)}
                    disabled={meters.length >= METER_TYPES.length}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un compteur
                  </Button>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMetersDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
