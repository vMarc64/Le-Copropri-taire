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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "lucide-react";

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

const lotTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  apartment: { label: "Appartement", icon: <Home className="h-4 w-4" />, color: "bg-blue-500/10 text-blue-600" },
  parking: { label: "Parking", icon: <Car className="h-4 w-4" />, color: "bg-purple-500/10 text-purple-600" },
  cellar: { label: "Cave", icon: <Warehouse className="h-4 w-4" />, color: "bg-amber-500/10 text-amber-600" },
  commercial: { label: "Commerce", icon: <Store className="h-4 w-4" />, color: "bg-emerald-500/10 text-emerald-600" },
  garage: { label: "Garage", icon: <Car className="h-4 w-4" />, color: "bg-gray-500/10 text-gray-600" },
};

export default function LotsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: condoId } = use(params);
  const [search, setSearch] = useState("");
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
    return (
      lot.reference.toLowerCase().includes(search.toLowerCase()) ||
      (lot.owner?.name.toLowerCase().includes(search.toLowerCase()) ?? false)
    );
  });

  const stats = {
    total: lots.length,
    apartments: lots.filter((l) => l.type === "apartment").length,
    parkings: lots.filter((l) => l.type === "parking").length,
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
            <h1 className="text-3xl font-bold">Lots</h1>
            <p className="text-muted-foreground">
              Gérez les lots de la copropriété
            </p>
          </div>
        </div>
        <Button>
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
              <TableHead className="h-10 w-28 px-4 text-right font-medium">Solde</TableHead>
              <TableHead className="h-10 w-10 px-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLots.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <DoorOpen className="h-10 w-10 text-muted-foreground/50" />
                    <p className="font-medium">Aucun lot</p>
                    <p className="text-sm">Ajoutez votre premier lot pour commencer</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLots.map((lot) => {
                const typeConfig = lotTypeConfig[lot.type] || lotTypeConfig.apartment;
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
                      {lot.floor === 0 ? "RDC" : lot.floor}
                    </TableCell>
                    <TableCell className="h-12 px-4 text-center tabular-nums">
                      {lot.surface} m²
                    </TableCell>
                    <TableCell className="h-12 px-4 text-center tabular-nums">
                      {lot.tantiemes.toLocaleString("fr-FR")}
                    </TableCell>
                    <TableCell className="h-12 px-4">
                      {lot.owner ? (
                        <Link
                          href={`/app/condominiums/${condoId}/owners/${lot.owner.id}`}
                          className="text-sm hover:text-primary hover:underline"
                        >
                          {lot.owner.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">Non assigné</span>
                      )}
                    </TableCell>
                    <TableCell
                      className={`h-12 px-4 text-right font-medium tabular-nums ${
                        lot.balance < 0
                          ? "text-destructive"
                          : lot.balance > 0
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {lot.balance === 0
                        ? "0 €"
                        : `${lot.balance > 0 ? "+" : ""}${lot.balance.toLocaleString("fr-FR")} €`}
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
    </div>
  );
}
