"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getOwners, type Owner } from "@/lib/api";

function StatusBadge({ status }: { status: string }) {
  const config = {
    active: { label: "Actif", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    pending: { label: "En attente", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    suspended: { label: "Suspendu", className: "bg-destructive/10 text-destructive" },
  }[status] || { label: status, className: "bg-muted text-muted-foreground" };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
      {status === "active" && <CheckCircle2 className="h-3 w-3" />}
      {status === "pending" && <Clock className="h-3 w-3" />}
      {status === "suspended" && <AlertTriangle className="h-3 w-3" />}
      {config.label}
    </span>
  );
}

function BalanceBadge({ balance }: { balance: number }) {
  if (balance < 0) {
    return (
      <span className="text-sm font-semibold text-destructive">
        {balance.toLocaleString("fr-FR")} €
      </span>
    );
  } else if (balance > 0) {
    return (
      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
        +{balance.toLocaleString("fr-FR")} €
      </span>
    );
  }
  return (
    <span className="text-sm font-medium text-muted-foreground">
      0 €
    </span>
  );
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
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Propriétaires
            </h1>
            <p className="mt-1 text-[15px] text-muted-foreground">
              Gérez les copropriétaires de votre portefeuille
            </p>
          </div>
          <Button className="h-10 gap-2 rounded-lg px-4 text-[13px] font-medium">
            <Plus className="h-4 w-4" />
            Ajouter un propriétaire
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
                  <p className="text-[13px] text-muted-foreground">Total propriétaires</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stats.active}</p>
                  <p className="text-[13px] text-muted-foreground">Actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stats.withArrears}</p>
                  <p className="text-[13px] text-muted-foreground">Avec impayés</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stats.pendingMandate}</p>
                  <p className="text-[13px] text-muted-foreground">Sans mandat SEPA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou lot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-10 rounded-xl"
          />
        </div>

        {/* Owners List */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="grid min-w-[800px] grid-cols-12 gap-4 border-b border-border bg-muted/50 px-6 py-3">
              <div className="col-span-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Propriétaire
              </div>
              <div className="col-span-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Contact
              </div>
              <div className="col-span-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Copropriétés / Lots
              </div>
              <div className="col-span-2 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Solde
              </div>
              <div className="col-span-2 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Statut
              </div>
              <div className="col-span-1"></div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-border">
              {filteredOwners.map((owner) => (
                <Link
                  key={owner.id}
                  href={`/app/owners/${owner.id}`}
                  className="grid min-w-[800px] grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
                >
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-semibold text-primary">
                        {owner.firstName[0]}{owner.lastName[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-foreground">
                        {owner.firstName} {owner.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2 flex flex-col justify-center gap-1">
                    <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{owner.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{owner.phone}</span>
                    </div>
                  </div>

                  <div className="col-span-2 flex flex-col justify-center gap-1">
                    <div className="flex items-center gap-1.5 text-[13px] text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate">{owner.condominiums[0]}</span>
                      {owner.condominiums.length > 1 && (
                        <span className="text-muted-foreground">+{owner.condominiums.length - 1}</span>
                      )}
                    </div>
                    <div className="text-[13px] text-muted-foreground">
                      Lots: {owner.lots.join(", ")}
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-center">
                    <BalanceBadge balance={owner.balance} />
                  </div>

                  <div className="col-span-2 flex items-center justify-center">
                    <StatusBadge status={owner.status} />
                  </div>

                  <div className="col-span-1 flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                        <DropdownMenuItem>Envoyer un message</DropdownMenuItem>
                        <DropdownMenuItem>Voir les paiements</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {filteredOwners.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-[15px] font-medium text-foreground">Aucun propriétaire trouvé</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Essayez de modifier votre recherche
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
