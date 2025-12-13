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
  Eye,
  User,
  Edit,
  Loader2,
  AlertTriangle,
  Building2,
  Box,
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

export default function LotsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: condoId } = use(params);
  const [search, setSearch] = useState("");
  const [lots, setLots] = useState<Lot[]>([]);
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

  useEffect(() => {
    fetchLots();
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
          tantiemes: newLot.tantiemes ? parseInt(newLot.tantiemes) : undefined,
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
                <p className="text-3xl font-bold">{stats.totalTantiemes.toLocaleString("fr-FR")}</p>
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
                      <Link
                        href={`/app/condominiums/${condoId}/lots/${lot.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {lot.reference}
                      </Link>
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
                      {lot.tantiemes ? lot.tantiemes.toLocaleString("fr-FR") : "-"}
                    </TableCell>
                    <TableCell className="h-12 px-4">
                      {lot.owner ? (
                        <Link
                          href={`/app/owners`}
                          className="text-sm hover:text-primary hover:underline"
                        >
                          {lot.owner.name}
                        </Link>
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
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/app/condominiums/${condoId}/lots/${lot.id}`}
                              className="flex items-center"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Voir
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            Assigner
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
                value={newLot.tantiemes}
                onChange={(e) => setNewLot({ ...newLot, tantiemes: e.target.value })}
                className="col-span-3"
                placeholder="Ex: 150"
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
    </div>
  );
}
