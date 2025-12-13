"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, Plus, LayoutGrid, List, Eye, DoorOpen, Users, Settings, MoreVertical } from "lucide-react";
import { getCondominiums, type Condominium } from "@/lib/api";

export default function CondominiumsListPage() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getCondominiums();
        setCondominiums(data);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des copropriétés");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredCondos = condominiums.filter(
    (condo) =>
      condo.name.toLowerCase().includes(search.toLowerCase()) ||
      condo.address.toLowerCase().includes(search.toLowerCase()) ||
      condo.city.toLowerCase().includes(search.toLowerCase())
  );

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
        <div>
          <h1 className="text-3xl font-bold">Copropriétés</h1>
          <p className="text-muted-foreground">
            Gérez vos {condominiums.length} copropriété{condominiums.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/app/condominiums/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle copropriété
          </Link>
        </Button>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Rechercher par nom, adresse, ville..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-1 rounded-lg border p-1">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="h-8 px-3"
          >
            <List className="mr-1.5 h-4 w-4" />
            Tableau
          </Button>
          <Button
            variant={viewMode === "cards" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cards")}
            className="h-8 px-3"
          >
            <LayoutGrid className="mr-1.5 h-4 w-4" />
            Cartes
          </Button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Nom</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead className="w-24 text-center">Lots</TableHead>
                <TableHead className="w-32 text-center">Propriétaires</TableHead>
                <TableHead className="w-28 text-right">Solde</TableHead>
                <TableHead className="w-24 text-center">SEPA</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
                <TableBody>
                  {filteredCondos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Aucune copropriété trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCondos.map((condo) => (
                      <TableRow key={condo.id} className="group">
                        <TableCell className="font-medium">
                          <Link
                            href={`/app/condominiums/${condo.id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {condo.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {condo.address}, {condo.postalCode} {condo.city}
                        </TableCell>
                        <TableCell className="text-center tabular-nums">{condo.lots}</TableCell>
                        <TableCell className="text-center tabular-nums">{condo.owners}</TableCell>
                        <TableCell className={`text-right font-medium tabular-nums ${condo.balance < 0 ? "text-destructive" : "text-emerald-600"}`}>
                          {condo.balance.toLocaleString('fr-FR')} €
                        </TableCell>
                        <TableCell className="text-center">
                          {condo.sepaEnabled ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              Actif
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-muted-foreground">
                              Inactif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <span className="sr-only">Actions</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem asChild>
                                <Link href={`/app/condominiums/${condo.id}`} className="flex items-center">
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/app/condominiums/${condo.id}/lots`} className="flex items-center">
                                  <DoorOpen className="mr-2 h-4 w-4" />
                                  Lots
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/app/condominiums/${condo.id}/owners`} className="flex items-center">
                                  <Users className="mr-2 h-4 w-4" />
                                  Propriétaires
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/app/condominiums/${condo.id}/settings`} className="flex items-center">
                                  <Settings className="mr-2 h-4 w-4" />
                                  Paramètres
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
        </Card>
      )}

      {/* Cards View */}
      {viewMode === "cards" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCondos.map((condo) => (
            <Link key={condo.id} href={`/app/condominiums/${condo.id}`}>
              <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{condo.name}</CardTitle>
                    {condo.sepaEnabled && <Badge>SEPA</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {condo.address}, {condo.postalCode} {condo.city}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{condo.lots}</p>
                      <p className="text-xs text-muted-foreground">Lots</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{condo.owners}</p>
                      <p className="text-xs text-muted-foreground">Propriétaires</p>
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${condo.balance < 0 ? "text-destructive" : "text-green-600"}`}>
                        {(condo.balance / 1000).toFixed(1)}k
                      </p>
                      <p className="text-xs text-muted-foreground">Solde €</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{filteredCondos.length} copropriété(s) affichée(s)</span>
        <span>
          Total: {filteredCondos.reduce((acc, c) => acc + c.lots, 0)} lots,{" "}
          {filteredCondos.reduce((acc, c) => acc + c.owners, 0)} propriétaires
        </span>
      </div>
    </div>
  );
}
