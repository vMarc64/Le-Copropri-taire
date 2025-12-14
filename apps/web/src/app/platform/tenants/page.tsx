"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Building2, Search, Plus, MoreVertical, Eye, Pencil, Pause, Play, Check } from "lucide-react";
import { getSyndics, type Syndic } from "@/lib/api";

type TenantStatus = "active" | "pending" | "suspended";

const statusConfig: Record<TenantStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  active: { label: "Actif", variant: "default" },
  pending: { label: "En attente", variant: "secondary" },
  suspended: { label: "Suspendu", variant: "destructive" },
};

export default function TenantsListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TenantStatus | "all">("all");
  const [tenants, setTenants] = useState<Syndic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await getSyndics();
        setTenants(response.data);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des gestionnaires");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(search.toLowerCase()) ||
      tenant.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Gestionnaires</h1>
          <p className="text-[15px] text-muted-foreground mt-1">
            Liste des Property Managers inscrits sur la plateforme
          </p>
        </div>
        <Link href="/platform/tenants/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Gestionnaire
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            Tous
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("active")}
          >
            Actifs
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
          >
            En attente
          </Button>
          <Button
            variant={statusFilter === "suspended" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("suspended")}
          >
            Suspendus
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          {filteredTenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Building2 className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="mt-4 text-[14px] font-medium text-foreground">Aucun gestionnaire trouvé</p>
              <p className="mt-1 text-[13px] text-muted-foreground">Modifiez vos filtres ou ajoutez un nouveau gestionnaire</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid min-w-[900px] grid-cols-12 gap-4 border-b border-border bg-muted/50 px-6 py-3">
                <div className="col-span-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Nom
                </div>
                <div className="col-span-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </div>
                <div className="col-span-1 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Copropriétés
                </div>
                <div className="col-span-1 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Managers
                </div>
                <div className="col-span-2 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Statut
                </div>
                <div className="col-span-2 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Créé le
                </div>
              </div>
              
              {/* Table Rows */}
              <div className="divide-y divide-border">
                {filteredTenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="grid min-w-[900px] grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-muted/50 group"
                  >
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-[14px] font-medium text-foreground truncate">{tenant.name}</span>
                    </div>
                    <div className="col-span-3 flex items-center">
                      <span className="text-[14px] text-muted-foreground truncate">{tenant.email}</span>
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-secondary px-2.5 text-[13px] font-medium text-secondary-foreground">
                        {tenant.condominiumsCount ?? 0}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-secondary px-2.5 text-[13px] font-medium text-secondary-foreground">
                        {tenant.managersCount ?? 0}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <Badge 
                        variant="outline"
                        className={
                          tenant.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                            : tenant.status === 'suspended'
                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }
                      >
                        {statusConfig[tenant.status as TenantStatus]?.label ?? tenant.status}
                      </Badge>
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      <span className="text-[13px] text-muted-foreground">
                        {new Date(tenant.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/platform/tenants/${tenant.id}`} className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Voir détails
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/platform/tenants/${tenant.id}/edit`} className="flex items-center gap-2">
                              <Pencil className="h-4 w-4" />
                              Modifier
                            </Link>
                          </DropdownMenuItem>
                          {tenant.status === "active" ? (
                            <DropdownMenuItem className="text-destructive flex items-center gap-2">
                              <Pause className="h-4 w-4" />
                              Suspendre
                            </DropdownMenuItem>
                          ) : tenant.status === "suspended" ? (
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Play className="h-4 w-4" />
                              Réactiver
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Check className="h-4 w-4" />
                              Activer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="flex justify-between text-[13px] text-muted-foreground">
        <span>
          {filteredTenants.length} gestionnaire(s) affiché(s) sur {tenants.length}
        </span>
        <span>
          Total : {tenants.reduce((acc, t) => acc + (t.condominiumsCount ?? 0), 0)} copropriétés, {tenants.reduce((acc, t) => acc + (t.managersCount ?? 0), 0)} managers
        </span>
      </div>
    </div>
  );
}
