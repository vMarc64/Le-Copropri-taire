"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface Lot {
  id: string;
  reference: string;
  type: string;
  floor: number;
  surface: number;
  tantiemes: number;
  owner: { id: string; name: string } | null;
  balance: number;
  status: string;
}

const lotTypes: Record<string, { label: string; icon: string }> = {
  apartment: { label: "Appartement", icon: "🏠" },
  parking: { label: "Parking", icon: "🅿️" },
  cellar: { label: "Cave", icon: "🚪" },
  commercial: { label: "Commerce", icon: "🏪" },
  garage: { label: "Garage", icon: "🚗" },
};

export default function LotsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: condoId } = use(params);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // TODO: Fetch from API
        setLots([]);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des lots");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [condoId]);

  const filteredLots = lots.filter((lot) => {
    const matchesSearch = 
      lot.reference.toLowerCase().includes(search.toLowerCase()) ||
      (lot.owner?.name.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesType = typeFilter === "all" || lot.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: lots.length,
    apartments: lots.filter(l => l.type === "apartment").length,
    parkings: lots.filter(l => l.type === "parking").length,
    totalTantiemes: lots.reduce((sum, l) => sum + l.tantiemes, 0),
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
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/app/condominiums/${condoId}`}>
            <Button variant="ghost" size="sm">← Retour</Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">🚪 Gestion des lots</h1>
            <p className="text-muted-foreground">
              Gérez les lots de la copropriété
            </p>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>+ Ajouter un lot</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau lot</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau lot à la copropriété
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reference">Référence *</Label>
                <Input id="reference" placeholder="Ex: A12" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de lot" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(lotTypes).map(([key, { label, icon }]) => (
                        <SelectItem key={key} value={key}>
                          {icon} {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="floor">Étage</Label>
                  <Input id="floor" type="number" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="surface">Surface (m²)</Label>
                  <Input id="surface" type="number" placeholder="65" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tantiemes">Tantièmes *</Label>
                  <Input id="tantiemes" type="number" placeholder="100" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => setIsCreateOpen(false)}>
                Créer le lot
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total lots</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{stats.apartments}</p>
            <p className="text-sm text-muted-foreground">Appartements</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{stats.parkings}</p>
            <p className="text-sm text-muted-foreground">Parkings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{stats.totalTantiemes}</p>
            <p className="text-sm text-muted-foreground">Total tantièmes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Rechercher un lot ou propriétaire..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type de lot" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {Object.entries(lotTypes).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Étage</TableHead>
              <TableHead>Surface</TableHead>
              <TableHead>Tantièmes</TableHead>
              <TableHead>Propriétaire</TableHead>
              <TableHead className="text-right">Solde</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLots.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  Aucun lot trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredLots.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell className="font-medium">{lot.reference}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      {lotTypes[lot.type]?.icon} {lotTypes[lot.type]?.label}
                    </span>
                  </TableCell>
                  <TableCell>{lot.floor === 0 ? "RDC" : lot.floor}</TableCell>
                  <TableCell>{lot.surface} m²</TableCell>
                  <TableCell>{lot.tantiemes}</TableCell>
                  <TableCell>
                    {lot.owner ? (
                      <Link 
                        href={`/app/condominiums/${condoId}/owners/${lot.owner.id}`}
                        className="text-primary hover:underline"
                      >
                        {lot.owner.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={lot.status === "up-to-date" ? "default" : lot.status === "pending" ? "secondary" : "destructive"}>
                      {lot.balance === 0 ? "À jour" : `${lot.balance} €`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Voir</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
