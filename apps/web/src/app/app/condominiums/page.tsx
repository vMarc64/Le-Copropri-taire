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
import { Loader2 } from "lucide-react";
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
          <Link href="/app/condominiums/new">🏢 Nouvelle copropriété</Link>
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
        <div className="flex gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            📋 Tableau
          </Button>
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            🎴 Cartes
          </Button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead className="text-center">Lots</TableHead>
                  <TableHead className="text-center">Propriétaires</TableHead>
                  <TableHead className="text-right">Solde</TableHead>
                  <TableHead className="text-center">SEPA</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCondos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      Aucune copropriété trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCondos.map((condo) => (
                    <TableRow key={condo.id}>
                      <TableCell>
                        <Link
                          href={`/app/condominiums/${condo.id}`}
                          className="font-medium hover:underline"
                        >
                          {condo.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {condo.address}, {condo.postalCode} {condo.city}
                      </TableCell>
                      <TableCell className="text-center">{condo.lots}</TableCell>
                      <TableCell className="text-center">{condo.owners}</TableCell>
                      <TableCell className={`text-right font-medium ${condo.balance < 0 ? "text-destructive" : "text-green-600"}`}>
                        {condo.balance.toLocaleString()} €
                      </TableCell>
                      <TableCell className="text-center">
                        {condo.sepaEnabled ? (
                          <Badge variant="default">Actif</Badge>
                        ) : (
                          <Badge variant="secondary">Inactif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">⋮</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/app/condominiums/${condo.id}`}>👁️ Voir</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/app/condominiums/${condo.id}/lots`}>🚪 Lots</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/app/condominiums/${condo.id}/owners`}>👥 Propriétaires</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/app/condominiums/${condo.id}/settings`}>⚙️ Paramètres</Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
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
