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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
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
  Users,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Mail,
  Receipt,
  Loader2,
  Home,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CondoLot {
  id: string;
  reference: string;
  type: string;
  floor: number | null;
  surface: string | null;
  tantiemes: number | null;
  ownerId: string | null;
  isAssigned: boolean;
}

interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  lots: string[];
  lotIds?: string[];
  tantiemes: number;
  balance: number;
  status: string;
  sepaMandate: boolean;
}

interface LotSelectorProps {
  owner: Owner;
  condoId: string;
  onUpdate: () => void;
}

const LOT_TYPES = [
  { value: "appartement", label: "Appartement" },
  { value: "parking", label: "Parking" },
  { value: "cave", label: "Cave" },
  { value: "commerce", label: "Commerce" },
  { value: "bureau", label: "Bureau" },
  { value: "box", label: "Box" },
  { value: "autre", label: "Autre" },
];

function LotSelector({ owner, condoId, onUpdate }: LotSelectorProps) {
  const [open, setOpen] = useState(false);
  const [availableLots, setAvailableLots] = useState<CondoLot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newLot, setNewLot] = useState({
    reference: "",
    type: "appartement",
    floor: "",
    surface: "",
    tantiemes: "",
  });

  const loadAvailableLots = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/condominiums/${condoId}/lots/available?forOwner=${owner.id}`);
      if (response.ok) {
        const lots = await response.json();
        setAvailableLots(lots);
      }
    } catch (error) {
      console.error("Error loading available lots:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadAvailableLots();
    }
  }, [open, owner.id, condoId]);

  const handleToggle = async (lotId: string) => {
    const currentlyAssigned = availableLots.filter(l => l.isAssigned).map(l => l.id);
    const newSelection = currentlyAssigned.includes(lotId)
      ? currentlyAssigned.filter(id => id !== lotId)
      : [...currentlyAssigned, lotId];

    setIsSaving(true);
    
    // Optimistic update
    setAvailableLots(prev => prev.map(lot => ({
      ...lot,
      isAssigned: newSelection.includes(lot.id)
    })));

    try {
      const response = await fetch(`/api/condominiums/${condoId}/owners/${owner.id}/lots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lotIds: newSelection }),
      });
      
      if (response.ok) {
        onUpdate();
      } else {
        // Revert on error
        loadAvailableLots();
      }
    } catch (error) {
      console.error("Error updating lots:", error);
      loadAvailableLots();
    } finally {
      setIsSaving(false);
    }
  };

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
          ownerId: owner.id, // Auto-assign to current owner
        }),
      });

      if (response.ok) {
        // Reset form
        setNewLot({
          reference: "",
          type: "appartement",
          floor: "",
          surface: "",
          tantiemes: "",
        });
        setShowCreateDialog(false);
        // Reload available lots (new lot will be auto-selected since assigned to this owner)
        await loadAvailableLots();
        onUpdate();
      }
    } catch (error) {
      console.error("Error creating lot:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const assignedCount = owner.lots.length;
  const displayText = assignedCount === 0
    ? "Aucun"
    : assignedCount === 1
      ? owner.lots[0]
      : `${owner.lots[0]} +${assignedCount - 1}`;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-auto py-1 px-2 font-normal justify-start gap-1.5",
              assignedCount === 0 && "text-muted-foreground italic"
            )}
          >
            <Home className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate max-w-[100px]">{displayText}</span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
            {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Rechercher un lot..." />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : availableLots.length === 0 ? (
                <CommandEmpty>Aucun lot disponible</CommandEmpty>
              ) : (
                <CommandGroup>
                  {availableLots.map((lot) => (
                    <CommandItem
                      key={lot.id}
                      value={`${lot.reference} ${lot.type}`}
                      onSelect={() => handleToggle(lot.id)}
                      className="cursor-pointer"
                    >
                      <div className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        lot.isAssigned
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/50"
                      )}>
                        {lot.isAssigned && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{lot.reference}</span>
                          <Badge variant="outline" className="text-xs py-0 h-5">
                            {lot.type}
                          </Badge>
                        </div>
                        {lot.tantiemes && (
                          <span className="text-xs text-muted-foreground">
                            {lot.tantiemes} tantièmes
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setShowCreateDialog(true);
                  }}
                  className="cursor-pointer !bg-primary/10 !text-primary data-[selected=true]:!bg-primary/20 data-[selected=true]:!text-primary font-medium"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un lot
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Créer un lot</DialogTitle>
            <DialogDescription>
              Créez un nouveau lot qui sera automatiquement assigné à {owner.name}.
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
    </>
  );
}

export default function OwnersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: condoId } = use(params);
  const [search, setSearch] = useState("");
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/condominiums/${condoId}/owners`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement");
      }
      const data = await response.json();
      setOwners(data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des propriétaires");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [condoId]);

  const filteredOwners = owners.filter((owner) => {
    return (
      owner.name.toLowerCase().includes(search.toLowerCase()) ||
      owner.email.toLowerCase().includes(search.toLowerCase()) ||
      owner.lots.some((lot) => lot.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const stats = {
    total: owners.length,
    upToDate: owners.filter((o) => o.status === "up-to-date").length,
    overdue: owners.filter((o) => o.status === "overdue").length,
    sepaActive: owners.filter((o) => o.sepaMandate).length,
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
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
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
            <h1 className="text-3xl font-bold">Propriétaires</h1>
            <p className="text-muted-foreground">
              Gérez les propriétaires de la copropriété
            </p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un propriétaire
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.upToDate}</p>
                <p className="text-sm text-muted-foreground">À jour</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.overdue}</p>
                <p className="text-sm text-muted-foreground">En retard</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                <CreditCard className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.sepaActive}</p>
                <p className="text-sm text-muted-foreground">SEPA actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, email ou lot..."
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
              <TableHead className="h-10 px-4 font-medium">Propriétaire</TableHead>
              <TableHead className="h-10 px-4 font-medium">Contact</TableHead>
              <TableHead className="h-10 px-4 font-medium">Lots</TableHead>
              <TableHead className="h-10 w-24 px-4 text-center font-medium">Tantièmes</TableHead>
              <TableHead className="h-10 w-28 px-4 text-right font-medium">Solde</TableHead>
              <TableHead className="h-10 w-24 px-4 text-center font-medium">SEPA</TableHead>
              <TableHead className="h-10 w-10 px-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOwners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-10 w-10 text-muted-foreground/50" />
                    <p className="font-medium">Aucun propriétaire</p>
                    <p className="text-sm">Ajoutez votre premier propriétaire pour commencer</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOwners.map((owner) => (
                <TableRow
                  key={owner.id}
                  className="group border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell className="h-12 px-4 font-medium">
                    <Link
                      href={`/app/owners/${owner.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {owner.name}
                    </Link>
                  </TableCell>
                  <TableCell className="h-12 px-4">
                    <div className="text-sm">
                      <p>{owner.email}</p>
                      <p className="text-muted-foreground">{owner.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="h-12 px-4">
                    <LotSelector
                      owner={owner}
                      condoId={condoId}
                      onUpdate={fetchData}
                    />
                  </TableCell>
                  <TableCell className="h-12 px-4 text-center tabular-nums">
                    {owner.tantiemes}
                  </TableCell>
                  <TableCell
                    className={`h-12 px-4 text-right font-medium tabular-nums ${
                      owner.balance < 0
                        ? "text-destructive"
                        : owner.balance > 0
                        ? "text-emerald-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {owner.balance === 0
                      ? "0 €"
                      : `${owner.balance > 0 ? "+" : ""}${owner.balance.toLocaleString("fr-FR")} €`}
                  </TableCell>
                  <TableCell className="h-12 px-4 text-center">
                    <Badge
                      variant="outline"
                      className={
                        owner.sepaMandate
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-muted-foreground/30 bg-muted text-muted-foreground"
                      }
                    >
                      {owner.sepaMandate ? "Actif" : "Non"}
                    </Badge>
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
                            href={`/app/owners/${owner.id}`}
                            className="flex items-center"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Voir
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Contacter
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Receipt className="mr-2 h-4 w-4" />
                          Paiements
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
