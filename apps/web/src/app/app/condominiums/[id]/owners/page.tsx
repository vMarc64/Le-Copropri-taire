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
} from "lucide-react";

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
                      href={`/app/condominiums/${condoId}/owners/${owner.id}`}
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
                    <div className="flex gap-1 flex-wrap">
                      {owner.lots.map((lot) => (
                        <Badge key={lot} variant="outline" className="text-xs">
                          {lot}
                        </Badge>
                      ))}
                    </div>
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
                            href={`/app/condominiums/${condoId}/owners/${owner.id}`}
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
