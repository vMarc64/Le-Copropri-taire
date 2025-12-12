"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
const mockLots = [
  { 
    id: "1", 
    reference: "A12", 
    type: "apartment", 
    floor: 1, 
    surface: 65, 
    tantiemes: 120, 
    owner: { id: "1", name: "M. Dupont" },
    balance: 0,
    status: "up-to-date"
  },
  { 
    id: "2", 
    reference: "A13", 
    type: "apartment", 
    floor: 1, 
    surface: 48, 
    tantiemes: 90, 
    owner: { id: "2", name: "Mme Martin" },
    balance: -380,
    status: "pending"
  },
  { 
    id: "3", 
    reference: "B03", 
    type: "apartment", 
    floor: 0, 
    surface: 72, 
    tantiemes: 140, 
    owner: { id: "3", name: "M. Bernard" },
    balance: -520,
    status: "overdue"
  },
  { 
    id: "4", 
    reference: "P01", 
    type: "parking", 
    floor: -1, 
    surface: 12, 
    tantiemes: 15, 
    owner: { id: "1", name: "M. Dupont" },
    balance: 0,
    status: "up-to-date"
  },
  { 
    id: "5", 
    reference: "C05", 
    type: "cellar", 
    floor: -1, 
    surface: 6, 
    tantiemes: 8, 
    owner: { id: "2", name: "Mme Martin" },
    balance: 0,
    status: "up-to-date"
  },
];

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

  const filteredLots = mockLots.filter((lot) => {
    const matchesSearch = 
      lot.reference.toLowerCase().includes(search.toLowerCase()) ||
      lot.owner.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || lot.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: mockLots.length,
    apartments: mockLots.filter(l => l.type === "apartment").length,
    parkings: mockLots.filter(l => l.type === "parking").length,
    totalTantiemes: mockLots.reduce((sum, l) => sum + l.tantiemes, 0),
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
              <div className="grid gap-2">
                <Label htmlFor="owner">Propriétaire</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un propriétaire" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">M. Dupont</SelectItem>
                    <SelectItem value="2">Mme Martin</SelectItem>
                    <SelectItem value="3">M. Bernard</SelectItem>
                  </SelectContent>
                </Select>
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

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Link href={`/app/condominiums/${condoId}`}>
          <Button variant="ghost" size="sm">📊 Dashboard</Button>
        </Link>
        <Link href={`/app/condominiums/${condoId}/lots`}>
          <Button variant="default" size="sm">🚪 Lots</Button>
        </Link>
        <Link href={`/app/condominiums/${condoId}/owners`}>
          <Button variant="ghost" size="sm">👥 Propriétaires</Button>
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
            {filteredLots.map((lot) => (
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
                  <Link 
                    href={`/app/condominiums/${condoId}/owners/${lot.owner.id}`}
                    className="text-primary hover:underline"
                  >
                    {lot.owner.name}
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={lot.status === "up-to-date" ? "default" : lot.status === "pending" ? "secondary" : "destructive"}>
                    {lot.balance === 0 ? "À jour" : `${lot.balance} €`}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link href={`/app/condominiums/${condoId}/lots/${lot.id}`}>
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
