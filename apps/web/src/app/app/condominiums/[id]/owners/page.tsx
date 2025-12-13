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

interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  lots: string[];
  tantiemes: number;
  balance: number;
  status: string;
  sepaMandate: boolean;
}

export default function OwnersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: condoId } = use(params);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // TODO: Fetch from API
        setOwners([]);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des propriétaires");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [condoId]);

  const filteredOwners = owners.filter((owner) => {
    const matchesSearch = 
      owner.name.toLowerCase().includes(search.toLowerCase()) ||
      owner.email.toLowerCase().includes(search.toLowerCase()) ||
      owner.lots.some(lot => lot.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || owner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: owners.length,
    upToDate: owners.filter(o => o.status === "up-to-date").length,
    overdue: owners.filter(o => o.status === "overdue").length,
    sepaActive: owners.filter(o => o.sepaMandate).length,
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
            <h1 className="text-3xl font-bold">👥 Propriétaires</h1>
            <p className="text-muted-foreground">
              Gérez les propriétaires de la copropriété
            </p>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>+ Ajouter un propriétaire</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouveau propriétaire</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau propriétaire à la copropriété
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input id="name" placeholder="M. Jean Dupont" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" placeholder="email@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" placeholder="06 12 34 56 78" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Adresse postale</Label>
                <Input id="address" placeholder="12 rue des Lilas, 75020 Paris" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lots">Lots à associer</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner des lots" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A12">A12 - Appartement</SelectItem>
                    <SelectItem value="B03">B03 - Appartement</SelectItem>
                    <SelectItem value="P01">P01 - Parking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => setIsCreateOpen(false)}>
                Créer le propriétaire
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
            <p className="text-sm text-muted-foreground">Total propriétaires</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-green-600">{stats.upToDate}</p>
            <p className="text-sm text-muted-foreground">À jour</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
            <p className="text-sm text-muted-foreground">En retard</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{stats.sepaActive}</p>
            <p className="text-sm text-muted-foreground">Mandats SEPA actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Rechercher un propriétaire, email ou lot..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="up-to-date">À jour</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="overdue">En retard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Propriétaire</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Lots</TableHead>
              <TableHead>Tantièmes</TableHead>
              <TableHead className="text-right">Solde</TableHead>
              <TableHead>SEPA</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOwners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Aucun propriétaire trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredOwners.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell className="font-medium">{owner.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{owner.email}</p>
                      <p className="text-muted-foreground">{owner.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {owner.lots.map(lot => (
                        <Badge key={lot} variant="outline">{lot}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{owner.tantiemes}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={owner.status === "up-to-date" ? "default" : owner.status === "pending" ? "secondary" : "destructive"}>
                      {owner.balance === 0 ? "À jour" : `${owner.balance} €`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {owner.sepaMandate ? (
                      <Badge variant="default">✓ Actif</Badge>
                    ) : (
                      <Badge variant="outline">Non configuré</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/app/condominiums/${condoId}/owners/${owner.id}`}>
                      <Button variant="ghost" size="sm">Voir</Button>
                    </Link>
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
