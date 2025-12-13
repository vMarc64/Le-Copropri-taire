"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  email: string;
  siret: string;
  status: string;
  condominiums: number;
  users: number;
  createdAt: string;
}

type TenantStatus = "active" | "pending" | "suspended";

const statusConfig: Record<TenantStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  active: { label: "Actif", variant: "default" },
  pending: { label: "En attente", variant: "secondary" },
  suspended: { label: "Suspendu", variant: "destructive" },
};

export default function TenantsListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TenantStatus | "all">("all");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // TODO: Fetch from API
        setTenants([]);
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
      tenant.email.toLowerCase().includes(search.toLowerCase()) ||
      tenant.siret.includes(search);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestionnaires</h1>
          <p className="text-muted-foreground">
            Liste des Property Managers inscrits sur la plateforme
          </p>
        </div>
        <Link href="/platform/tenants/new">
          <Button>➕ Nouveau Gestionnaire</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par nom, email ou SIRET..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>SIRET</TableHead>
                <TableHead className="text-center">Copropriétés</TableHead>
                <TableHead className="text-center">Utilisateurs</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Aucun gestionnaire trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>{tenant.email}</TableCell>
                    <TableCell className="font-mono text-sm">{tenant.siret}</TableCell>
                    <TableCell className="text-center">{tenant.condominiums}</TableCell>
                    <TableCell className="text-center">{tenant.users}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[tenant.status as TenantStatus].variant}>
                        {statusConfig[tenant.status as TenantStatus].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{tenant.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            ⋮
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/platform/tenants/${tenant.id}`}>
                              👁️ Voir détails
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/platform/tenants/${tenant.id}/edit`}>
                              ✏️ Modifier
                            </Link>
                          </DropdownMenuItem>
                          {tenant.status === "active" ? (
                            <DropdownMenuItem className="text-destructive">
                              ⏸️ Suspendre
                            </DropdownMenuItem>
                          ) : tenant.status === "suspended" ? (
                            <DropdownMenuItem>
                              ▶️ Réactiver
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              ✅ Activer
                            </DropdownMenuItem>
                          )}
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

      {/* Stats */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          {filteredTenants.length} gestionnaire(s) affiché(s) sur {tenants.length}
        </span>
        <span>
          Total : {tenants.reduce((acc, t) => acc + t.condominiums, 0)} copropriétés, {tenants.reduce((acc, t) => acc + t.users, 0)} utilisateurs
        </span>
      </div>
    </div>
  );
}
