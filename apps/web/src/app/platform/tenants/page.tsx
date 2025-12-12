"use client";

import { useState } from "react";
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

// Mock data - will be replaced with API calls
const mockTenants = [
  {
    id: "1",
    name: "Syndic ABC",
    email: "contact@syndicabc.fr",
    siret: "12345678901234",
    status: "active",
    condominiums: 12,
    users: 45,
    createdAt: "2025-10-15",
  },
  {
    id: "2",
    name: "Gestion Immo Plus",
    email: "info@gestionimmo.fr",
    siret: "98765432109876",
    status: "active",
    condominiums: 8,
    users: 32,
    createdAt: "2025-11-02",
  },
  {
    id: "3",
    name: "Copro Expert",
    email: "admin@coproexpert.fr",
    siret: "45678901234567",
    status: "pending",
    condominiums: 0,
    users: 1,
    createdAt: "2025-12-05",
  },
  {
    id: "4",
    name: "Immo Gestion 360",
    email: "contact@immogestion360.fr",
    siret: "78901234567890",
    status: "suspended",
    condominiums: 5,
    users: 18,
    createdAt: "2025-08-20",
  },
  {
    id: "5",
    name: "Syndic Pro France",
    email: "hello@syndicpro.fr",
    siret: "23456789012345",
    status: "active",
    condominiums: 25,
    users: 89,
    createdAt: "2025-06-10",
  },
];

type TenantStatus = "active" | "pending" | "suspended";

const statusConfig: Record<TenantStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  active: { label: "Actif", variant: "default" },
  pending: { label: "En attente", variant: "secondary" },
  suspended: { label: "Suspendu", variant: "destructive" },
};

export default function TenantsListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TenantStatus | "all">("all");

  const filteredTenants = mockTenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(search.toLowerCase()) ||
      tenant.email.toLowerCase().includes(search.toLowerCase()) ||
      tenant.siret.includes(search);
    const matchesStatus = statusFilter === "all" || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          {filteredTenants.length} gestionnaire(s) affiché(s) sur {mockTenants.length}
        </span>
        <span>
          Total : {mockTenants.reduce((acc, t) => acc + t.condominiums, 0)} copropriétés, {mockTenants.reduce((acc, t) => acc + t.users, 0)} utilisateurs
        </span>
      </div>
    </div>
  );
}
