"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  Plus,
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getOwners, type Owner } from "@/lib/api";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { label: "Actif", variant: "default" },
    pending: { label: "En attente", variant: "secondary" },
    suspended: { label: "Suspendu", variant: "destructive" },
  };

  const { label, variant } = config[status] || { label: status, variant: "outline" as const };

  return (
    <Badge variant={variant} className="gap-1">
      {status === "active" && <CheckCircle2 className="h-3 w-3" />}
      {status === "pending" && <Clock className="h-3 w-3" />}
      {status === "suspended" && <AlertTriangle className="h-3 w-3" />}
      {label}
    </Badge>
  );
}

function SepaBadge({ hasMandate }: { hasMandate: boolean }) {
  return hasMandate ? (
    <Badge variant="default" className="gap-1 bg-emerald-500 hover:bg-emerald-600">
      <CreditCard className="h-3 w-3" />
      Actif
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
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

export default function OwnersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getOwners();
        setOwners(data);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des propriétaires");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredOwners = owners.filter((owner) => {
    const fullName = `${owner.firstName} ${owner.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      fullName.includes(query) ||
      owner.email.toLowerCase().includes(query) ||
      owner.lots.some((lot) => lot.toLowerCase().includes(query))
    );
  });

  const stats = {
    total: owners.length,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Propriétaires</h1>
          <p className="text-muted-foreground">
            Gérez les {owners.length} propriétaire{owners.length > 1 ? "s" : ""} de votre portefeuille
          </p>
        </div>
        <Button asChild>
          <Link href="/app/owners/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau propriétaire
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
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
                <p className="text-3xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Actifs</p>
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
                <p className="text-3xl font-bold">{stats.withArrears}</p>
                <p className="text-sm text-muted-foreground">Avec impayés</p>
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
                <p className="text-3xl font-bold">{stats.pendingMandate}</p>
                <p className="text-sm text-muted-foreground">Sans mandat SEPA</p>
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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Owners Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propriétaire</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Copropriétés</TableHead>
                <TableHead className="text-center">Lots</TableHead>
                <TableHead className="text-right">Solde</TableHead>
                <TableHead className="text-center">SEPA</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOwners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-10 w-10 text-muted-foreground/50" />
                      <p className="font-medium">Aucun propriétaire trouvé</p>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery
                          ? "Essayez de modifier votre recherche"
                          : "Ajoutez votre premier propriétaire pour commencer"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOwners.map((owner) => {
                  const balance = formatBalance(owner.balance);
                  return (
                    <TableRow key={owner.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-semibold text-primary">
                              {owner.firstName[0]}{owner.lastName[0]}
                            </span>
                          </div>
                          <Link
                            href={`/app/owners/${owner.id}`}
                            className="font-medium hover:underline"
                          >
                            {owner.firstName} {owner.lastName}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
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
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate max-w-[150px]">
                            {owner.condominiums[0] || "Aucune"}
                          </span>
                          {owner.condominiums.length > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              +{owner.condominiums.length - 1}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm text-muted-foreground">
                          {owner.lots.length > 0 ? owner.lots.join(", ") : "-"}
                        </span>
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
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/app/owners/${owner.id}`}>
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
        </CardContent>
      </Card>
    </div>
  );
}
