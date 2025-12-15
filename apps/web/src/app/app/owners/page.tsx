"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Phone,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Loader2,
  CreditCard,
  UserX,
  Eye,
  Send,
  Receipt,
  Check,
  ChevronsUpDown,
  Home,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getOwners, getCondominiums, updateOwnerCondominiums, getAvailableLotsForOwner, updateOwnerLots, type Owner, type Condominium, type AvailableLot, type GetOwnersParams } from "@/lib/api";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bgColor: string; textColor: string; icon: React.ReactNode }> = {
    active: { 
      label: "Actif", 
      bgColor: "bg-emerald-100 dark:bg-emerald-950", 
      textColor: "text-emerald-700 dark:text-emerald-400",
      icon: <CheckCircle2 className="h-3 w-3" />
    },
    pending: { 
      label: "En attente", 
      bgColor: "bg-amber-100 dark:bg-amber-950", 
      textColor: "text-amber-700 dark:text-amber-400",
      icon: <Clock className="h-3 w-3" />
    },
    invited: { 
      label: "Invité", 
      bgColor: "bg-blue-100 dark:bg-blue-950", 
      textColor: "text-blue-700 dark:text-blue-400",
      icon: <Mail className="h-3 w-3" />
    },
    suspended: { 
      label: "Suspendu", 
      bgColor: "bg-red-100 dark:bg-red-950", 
      textColor: "text-red-700 dark:text-red-400",
      icon: <AlertTriangle className="h-3 w-3" />
    },
  };

  const statusConfig = config[status] || { 
    label: status, 
    bgColor: "bg-gray-100 dark:bg-gray-800", 
    textColor: "text-gray-700 dark:text-gray-400",
    icon: null
  };

  return (
    <Badge variant="secondary" className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0 gap-1`}>
      {statusConfig.icon}
      {statusConfig.label}
    </Badge>
  );
}

function SepaBadge({ hasMandate }: { hasMandate: boolean }) {
  return hasMandate ? (
    <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0">
      <CreditCard className="h-3 w-3" />
      Actif
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0">
      <UserX className="h-3 w-3" />
      Aucun
    </Badge>
  );
}

function formatBalance(balance: number): { text: string; className: string } {
  if (balance < 0) {
    return {
      text: `${balance.toLocaleString("fr-FR")} €`,
      className: "text-destructive font-semibold",
    };
  } else if (balance > 0) {
    return {
      text: `+${balance.toLocaleString("fr-FR")} €`,
      className: "text-emerald-600 dark:text-emerald-400 font-semibold",
    };
  }
  return {
    text: "0 €",
    className: "text-muted-foreground",
  };
}

interface CondominiumSelectorProps {
  owner: Owner;
  allCondominiums: Condominium[];
  onUpdate: () => void;
}

function CondominiumSelector({ owner, allCondominiums, onUpdate }: CondominiumSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(owner.condominiumIds || []);
  const [isSaving, setIsSaving] = useState(false);

  // Reset selectedIds when owner changes
  useEffect(() => {
    setSelectedIds(owner.condominiumIds || []);
  }, [owner.condominiumIds]);

  const handleToggle = async (condoId: string) => {
    const newSelection = selectedIds.includes(condoId)
      ? selectedIds.filter((id) => id !== condoId)
      : [...selectedIds, condoId];

    setSelectedIds(newSelection);
    setIsSaving(true);

    try {
      await updateOwnerCondominiums(owner.id, newSelection);
      onUpdate();
    } catch (error) {
      console.error("Error updating condominiums:", error);
      // Revert on error
      setSelectedIds(owner.condominiumIds || []);
    } finally {
      setIsSaving(false);
    }
  };

  const displayText = owner.condominiums.length === 0
    ? "Aucune"
    : owner.condominiums.length === 1
      ? owner.condominiums[0]
      : `${owner.condominiums[0]} +${owner.condominiums.length - 1}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-auto py-1 px-2 font-normal justify-start gap-1.5",
            owner.condominiums.length === 0 && "text-muted-foreground italic"
          )}
        >
          <Building2 className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate max-w-[120px]">{displayText}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
          {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher..." />
          <CommandList>
            <CommandEmpty>Aucune copropriété trouvée</CommandEmpty>
            <CommandGroup>
              {allCondominiums.map((condo) => {
                const isSelected = selectedIds.includes(condo.id);
                return (
                  <CommandItem
                    key={condo.id}
                    value={condo.name}
                    onSelect={() => handleToggle(condo.id)}
                    className="cursor-pointer"
                  >
                    <div className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/50"
                    )}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm">{condo.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {condo.city}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface LotSelectorProps {
  owner: Owner;
  ownerCondominiums: Condominium[];
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

function LotSelector({ owner, ownerCondominiums, onUpdate }: LotSelectorProps) {
  const [open, setOpen] = useState(false);
  const [availableLots, setAvailableLots] = useState<AvailableLot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newLot, setNewLot] = useState({
    condominiumId: "",
    reference: "",
    type: "appartement",
    floor: "",
    surface: "",
    tantiemes: "",
  });

  const hasCondominiums = (owner.condominiumIds?.length || 0) > 0;

  const loadAvailableLots = async () => {
    if (!hasCondominiums) return;
    
    setIsLoading(true);
    try {
      const lots = await getAvailableLotsForOwner(owner.id);
      setAvailableLots(lots);
    } catch (error) {
      console.error("Error loading available lots:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && hasCondominiums) {
      loadAvailableLots();
    }
  }, [open, owner.id, hasCondominiums]);

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
      await updateOwnerLots(owner.id, newSelection);
      onUpdate();
    } catch (error) {
      console.error("Error updating lots:", error);
      // Revert on error
      loadAvailableLots();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateLot = async () => {
    if (!newLot.reference.trim() || !newLot.type || !newLot.condominiumId) return;

    setIsCreating(true);
    try {
      const response = await fetch(`/api/condominiums/${newLot.condominiumId}/lots`, {
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
          condominiumId: ownerCondominiums.length === 1 ? ownerCondominiums[0].id : "",
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

  // Set default condominium when dialog opens
  useEffect(() => {
    if (showCreateDialog && ownerCondominiums.length === 1) {
      setNewLot(prev => ({ ...prev, condominiumId: ownerCondominiums[0].id }));
    }
  }, [showCreateDialog, ownerCondominiums]);

  const assignedCount = owner.lots.length;
  const displayText = assignedCount === 0
    ? "Aucun"
    : assignedCount === 1
      ? owner.lots[0]
      : `${owner.lots[0]} +${assignedCount - 1}`;

  // If no condominiums, show disabled state
  if (!hasCondominiums) {
    return (
      <span className="text-sm text-muted-foreground italic flex items-center gap-1.5">
        <Home className="h-3.5 w-3.5" />
        -
      </span>
    );
  }

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
      <PopoverContent className="w-[320px] p-0" align="start">
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
                    value={`${lot.reference} ${lot.type} ${lot.condominiumName}`}
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
                      <span className="text-xs text-muted-foreground">
                        {lot.condominiumName}
                        {lot.tantiemes && ` • ${lot.tantiemes} tantièmes`}
                      </span>
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
            Créez un nouveau lot qui sera automatiquement assigné à {owner.firstName} {owner.lastName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {ownerCondominiums.length > 1 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="condominium" className="text-right">
                Copropriété *
              </Label>
              <Select
                value={newLot.condominiumId}
                onValueChange={(value) => setNewLot({ ...newLot, condominiumId: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une copropriété" />
                </SelectTrigger>
                <SelectContent>
                  {ownerCondominiums.map((condo) => (
                    <SelectItem key={condo.id} value={condo.id}>
                      {condo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
            disabled={!newLot.reference.trim() || !newLot.type || !newLot.condominiumId || isCreating}
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

export default function OwnersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [owners, setOwners] = useState<Owner[]>([]);
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filter state
  const [selectedCondominiumId, setSelectedCondominiumId] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"search" | "invite">("search");
  const [orphanSearchQuery, setOrphanSearchQuery] = useState("");
  const [orphanResults, setOrphanResults] = useState<any[]>([]);
  const [isSearchingOrphans, setIsSearchingOrphans] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newOwnerForm, setNewOwnerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedCondominiumId, limit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: GetOwnersParams = {
        page,
        limit,
        search: debouncedSearch || undefined,
        condominiumId: selectedCondominiumId || undefined,
      };
      const [ownersResponse, condosData] = await Promise.all([
        getOwners(params),
        getCondominiums(),
      ]);
      setOwners(ownersResponse.data);
      setTotal(ownersResponse.total);
      setTotalPages(ownersResponse.totalPages);
      setCondominiums(condosData);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, debouncedSearch, selectedCondominiumId]);

  const handleSearchOrphans = async () => {
    if (!orphanSearchQuery.trim() || orphanSearchQuery.trim().length < 2) return;
    
    setIsSearchingOrphans(true);
    setHasSearched(true);
    try {
      const response = await fetch(`/api/owners/search?q=${encodeURIComponent(orphanSearchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setOrphanResults(data);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
    } finally {
      setIsSearchingOrphans(false);
    }
  };

  const handleAssociate = async (ownerId: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/owners/${ownerId}/associate`, {
        method: "POST",
      });
      
      if (response.ok) {
        setIsModalOpen(false);
        setOrphanSearchQuery("");
        setOrphanResults([]);
        fetchData();
      }
    } catch (error) {
      console.error("Erreur lors de l'association:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOwnerForm),
      });
      
      if (response.ok) {
        setIsModalOpen(false);
        setNewOwnerForm({ firstName: "", lastName: "", email: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    total: total,
    active: owners.filter((o) => o.status === "active").length,
    withArrears: owners.filter((o) => o.balance < 0).length,
    pendingMandate: owners.filter((o) => !o.hasSepaMandateActive).length,
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Propriétaires</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les {owners.length} propriétaire{owners.length > 1 ? "s" : ""} de votre portefeuille
          </p>
        </div>
        <Dialog 
          open={isModalOpen} 
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setOrphanSearchQuery("");
              setOrphanResults([]);
              setHasSearched(false);
              setModalTab("search");
              setNewOwnerForm({ firstName: "", lastName: "", email: "" });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un propriétaire</DialogTitle>
              <DialogDescription>
                Recherchez un propriétaire existant ou invitez-en un nouveau
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={modalTab} onValueChange={(v) => setModalTab(v as "search" | "invite")} className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search" className="gap-2">
                  <Search className="h-4 w-4" />
                  Rechercher
                </TabsTrigger>
                <TabsTrigger value="invite" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Inviter
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="search" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Recherchez parmi les propriétaires qui ne sont pas encore associés à un syndic.
                </p>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Nom, prénom ou email..."
                    value={orphanSearchQuery}
                    onChange={(e) => setOrphanSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchOrphans()}
                  />
                  <Button 
                    onClick={handleSearchOrphans} 
                    disabled={isSearchingOrphans || orphanSearchQuery.length < 2}
                    size="icon"
                  >
                    {isSearchingOrphans ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {orphanResults.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{orphanResults.length} résultat(s)</p>
                    <div className="max-h-[200px] overflow-y-auto divide-y rounded-lg border">
                      {orphanResults.map((owner) => (
                        <div
                          key={owner.id}
                          className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              <span className="text-xs font-semibold text-primary">
                                {owner.firstName?.[0]}{owner.lastName?.[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {owner.firstName} {owner.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{owner.email}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAssociate(owner.id)}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Associer"
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasSearched && !isSearchingOrphans && orphanResults.length === 0 && (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    <UserX className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Aucun propriétaire orphelin trouvé.
                    <br />
                    <Button 
                      variant="link" 
                      className="mt-1 p-0 h-auto"
                      onClick={() => setModalTab("invite")}
                    >
                      Inviter un nouveau propriétaire
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="invite" className="mt-4">
                <div className="mb-4 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                  <Mail className="inline h-4 w-4 mr-1.5" />
                  Une invitation sera envoyée par email pour créer son compte.
                </div>
                <form onSubmit={handleCreateOwner} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={newOwnerForm.firstName}
                        onChange={(e) => setNewOwnerForm({ ...newOwnerForm, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={newOwnerForm.lastName}
                        onChange={(e) => setNewOwnerForm({ ...newOwnerForm, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newOwnerForm.email}
                      onChange={(e) => setNewOwnerForm({ ...newOwnerForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Envoyer l'invitation
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-blue-500/10">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{stats.total}</p>
              <p className="text-[11px] md:text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{stats.active}</p>
              <p className="text-[11px] md:text-xs text-muted-foreground">Actifs</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{stats.withArrears}</p>
              <p className="text-[11px] md:text-xs text-muted-foreground">Impayés</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-amber-500/10">
              <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{stats.pendingMandate}</p>
              <p className="text-[11px] md:text-xs text-muted-foreground">Sans SEPA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou lot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCondominiumId} onValueChange={setSelectedCondominiumId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Toutes les copropriétés" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les copropriétés</SelectItem>
              {condominiums.map((condo) => (
                <SelectItem key={condo.id} value={condo.id}>
                  {condo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">Afficher</span>
          <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v, 10))}>
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground hidden sm:inline">par page</span>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-3">
        {owners.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center rounded-lg border bg-card">
            <Users className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground text-sm">
              {searchQuery ? "Aucun propriétaire trouvé" : "Aucun propriétaire"}
            </p>
            {!searchQuery && (
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            )}
          </div>
        ) : (
          owners.map((owner) => {
            const balance = formatBalance(owner.balance);
            return (
              <div key={owner.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link href={owner.condominiumIds?.[0] ? `/app/condominiums/${owner.condominiumIds[0]}/owners/${owner.id}` : '#'} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-semibold text-primary">
                        {owner.firstName[0]}{owner.lastName[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{owner.firstName} {owner.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{owner.email}</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={owner.status} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={owner.condominiumIds?.[0] ? `/app/condominiums/${owner.condominiumIds[0]}/owners/${owner.id}` : '#'}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir le profil
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="mr-2 h-4 w-4" />
                          Envoyer un message
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Receipt className="mr-2 h-4 w-4" />
                          Voir les paiements
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Gérer le mandat SEPA
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  <span className={`font-medium ${balance.className}`}>{balance.text}</span>
                  <SepaBadge hasMandate={owner.hasSepaMandateActive} />
                  {owner.condominiums && owner.condominiums.length > 0 && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      {owner.condominiums.length} copro.
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Owners Table */}
      <div className="rounded-md border bg-card hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-medium">Propriétaire</TableHead>
              <TableHead className="font-medium hidden lg:table-cell">Contact</TableHead>
              <TableHead className="font-medium hidden xl:table-cell">Copropriétés</TableHead>
              <TableHead className="font-medium hidden xl:table-cell">Lots</TableHead>
              <TableHead className="font-medium text-right w-[100px]">Solde</TableHead>
              <TableHead className="font-medium text-center w-[100px]">SEPA</TableHead>
              <TableHead className="font-medium text-center w-[100px]">Statut</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {owners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? "Aucun propriétaire trouvé"
                        : "Aucun propriétaire"}
                    </p>
                    {!searchQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Ajouter un propriétaire
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              owners.map((owner) => {
                const balance = formatBalance(owner.balance);
                return (
                  <TableRow 
                    key={owner.id}
                    className="group border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-xs font-semibold text-primary">
                            {owner.firstName[0]}{owner.lastName[0]}
                          </span>
                        </div>
                        <Link
                          href={owner.condominiumIds?.[0] ? `/app/condominiums/${owner.condominiumIds[0]}/owners/${owner.id}` : '#'}
                          className="font-medium hover:underline"
                        >
                          {owner.firstName} {owner.lastName}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[180px]">{owner.email}</span>
                        </div>
                        {owner.phone && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{owner.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <CondominiumSelector
                        owner={owner}
                        allCondominiums={condominiums}
                        onUpdate={fetchData}
                      />
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <LotSelector
                        owner={owner}
                        ownerCondominiums={condominiums.filter(c => owner.condominiumIds?.includes(c.id))}
                        onUpdate={fetchData}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={balance.className}>{balance.text}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <SepaBadge hasMandate={owner.hasSepaMandateActive} />
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={owner.status} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-100 md:opacity-0 transition-opacity md:group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={owner.condominiumIds?.[0] ? `/app/condominiums/${owner.condominiumIds[0]}/owners/${owner.id}` : '#'}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir le profil
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="mr-2 h-4 w-4" />
                            Envoyer un message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Receipt className="mr-2 h-4 w-4" />
                            Voir les paiements
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Gérer le mandat SEPA
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Affichage {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} sur {total} résultats
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v, 10))}>
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "ghost"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
