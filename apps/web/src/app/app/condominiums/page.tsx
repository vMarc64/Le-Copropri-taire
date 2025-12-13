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
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/50 hover:bg-muted/50">
                <TableHead className="h-10 px-4 font-medium">Nom</TableHead>
                <TableHead className="h-10 px-4 font-medium">Adresse</TableHead>
                <TableHead className="h-10 w-20 px-4 text-center font-medium">Lots</TableHead>
                <TableHead className="h-10 w-28 px-4 text-center font-medium">Propriétaires</TableHead>
                <TableHead className="h-10 w-24 px-4 text-right font-medium">Solde</TableHead>
                <TableHead className="h-10 w-20 px-4 text-center font-medium">SEPA</TableHead>
                <TableHead className="h-10 w-10 px-2"></TableHead>
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
                  <TableRow 
                    key={condo.id} 
                    className="group border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="h-12 px-4 font-medium">
                      <Link
                        href={`/app/condominiums/${condo.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {condo.name}
                      </Link>
                    </TableCell>
                    <TableCell className="h-12 px-4 text-muted-foreground">
                      {condo.address}, {condo.postalCode} {condo.city}
                    </TableCell>
                    <TableCell className="h-12 px-4 text-center tabular-nums">{condo.lots}</TableCell>
                    <TableCell className="h-12 px-4 text-center tabular-nums">{condo.owners}</TableCell>
                    <TableCell className={`h-12 px-4 text-right font-medium tabular-nums ${condo.balance < 0 ? "text-destructive" : "text-emerald-600"}`}>
                      {condo.balance.toLocaleString('fr-FR')} €
                    </TableCell>
                    <TableCell className="h-12 px-4 text-center">
                      <Badge 
                        variant="outline" 
                        className={condo.sepaEnabled 
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                          : "border-muted-foreground/30 bg-muted text-muted-foreground"
                        }
                      >
                        {condo.sepaEnabled ? "Actif" : "Inactif"}
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
          
          {/* Table Footer */}
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {filteredCondos.length} copropriété{filteredCondos.length > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {filteredCondos.reduce((acc, c) => acc + c.lots, 0)} lots
              </span>
              <span>•</span>
              <span>
                {filteredCondos.reduce((acc, c) => acc + c.owners, 0)} propriétaires
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cards View */}
      {viewMode === "cards" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCondos.length === 0 ? (
            <div className="col-span-full flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
              Aucune copropriété trouvée
            </div>
          ) : (
            filteredCondos.map((condo) => (
              <Link key={condo.id} href={`/app/condominiums/${condo.id}`}>
                <Card className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
                  {/* Header with gradient accent */}
                  <div className="h-1.5 bg-gradient-to-r from-primary/80 to-primary/40" />
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                          {condo.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground truncate">
                          {condo.address}, {condo.postalCode} {condo.city}
                        </p>
                      </div>
                      {condo.sepaEnabled && (
                        <Badge 
                          variant="outline" 
                          className="shrink-0 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        >
                          SEPA
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-xl font-bold tabular-nums">{condo.lots}</p>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Lots</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-xl font-bold tabular-nums">{condo.owners}</p>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Propriétaires</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className={`text-xl font-bold tabular-nums ${condo.balance < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {condo.balance >= 1000 || condo.balance <= -1000 
                            ? `${(condo.balance / 1000).toFixed(1)}k` 
                            : condo.balance.toLocaleString('fr-FR')
                          }€
                        </p>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Solde</p>
                      </div>
                    </div>
                  </CardContent>

                  {/* Hover arrow indicator */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      →
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
