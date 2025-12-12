"use client";

import { use, useState } from "react";
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

// Mock data
const mockOwners = [
  { 
    id: "1", 
    name: "M. Jean Dupont", 
    email: "jean.dupont@email.com",
    phone: "06 12 34 56 78",
    lots: ["A12", "P01"],
    tantiemes: 135,
    balance: 0,
    status: "up-to-date",
    sepaMandate: true,
  },
  { 
    id: "2", 
    name: "Mme Marie Martin", 
    email: "marie.martin@email.com",
    phone: "06 98 76 54 32",
    lots: ["A13", "C05"],
    tantiemes: 98,
    balance: -380,
    status: "pending",
    sepaMandate: true,
  },
  { 
    id: "3", 
    name: "M. Pierre Bernard", 
    email: "pierre.bernard@email.com",
    phone: "07 11 22 33 44",
    lots: ["B03"],
    tantiemes: 140,
    balance: -520,
    status: "overdue",
    sepaMandate: false,
  },
  { 
    id: "4", 
    name: "Mme Sophie Petit", 
    email: "sophie.petit@email.com",
    phone: "06 55 44 33 22",
    lots: ["B04", "P02"],
    tantiemes: 110,
    balance: 0,
    status: "up-to-date",
    sepaMandate: true,
  },
];

export default function OwnersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: condoId } = use(params);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredOwners = mockOwners.filter((owner) => {
    const matchesSearch = 
      owner.name.toLowerCase().includes(search.toLowerCase()) ||
      owner.email.toLowerCase().includes(search.toLowerCase()) ||
      owner.lots.some(lot => lot.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || owner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockOwners.length,
    upToDate: mockOwners.filter(o => o.status === "up-to-date").length,
    overdue: mockOwners.filter(o => o.status === "overdue").length,
    sepaActive: mockOwners.filter(o => o.sepaMandate).length,
  };

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

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Link href={`/app/condominiums/${condoId}`}>
          <Button variant="ghost" size="sm">📊 Dashboard</Button>
        </Link>
        <Link href={`/app/condominiums/${condoId}/lots`}>
          <Button variant="ghost" size="sm">🚪 Lots</Button>
        </Link>
        <Link href={`/app/condominiums/${condoId}/owners`}>
          <Button variant="default" size="sm">👥 Propriétaires</Button>
        </Link>
        <Link href={`/app/condominiums/${condoId}/bank`}>
          <Button variant="ghost" size="sm">🏦 Banque</Button>
        </Link>
        <Link href={`/app/condominiums/${condoId}/documents`}>
          <Button variant="ghost" size="sm">📁 Documents</Button>
        </Link>
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
            {filteredOwners.map((owner) => (
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
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
