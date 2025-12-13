"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface Condominium {
  id: string;
  name: string;
  address: string;
  lots: number;
  owners: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  siret: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  status: "active" | "pending" | "suspended";
  createdAt: string;
  condominiums: Condominium[];
  users: User[];
}

const statusConfig = {
  active: { label: "Actif", variant: "default" as const },
  pending: { label: "En attente", variant: "secondary" as const },
  suspended: { label: "Suspendu", variant: "destructive" as const },
};

const roleLabels: Record<string, string> = {
  admin: "Administrateur",
  manager: "Gestionnaire",
};

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTenant() {
      try {
        setLoading(true);
        // TODO: Fetch from API
        setTenant(null);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement du gestionnaire");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTenant();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">
          {error || "Gestionnaire non trouvé"}
        </p>
        <Link href="/platform/tenants">
          <Button variant="outline">← Retour à la liste</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/platform/tenants">
            <Button variant="ghost" size="sm">
              ← Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{tenant.name}</h1>
            <p className="text-muted-foreground">
              SIRET: {tenant.siret} • Créé le {tenant.createdAt}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={statusConfig[tenant.status].variant}>
            {statusConfig[tenant.status].label}
          </Badge>
          <Link href={`/platform/tenants/${id}/edit`}>
            <Button>✏️ Modifier</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tenant.condominiums.length}</div>
            <p className="text-sm text-muted-foreground">Copropriétés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {tenant.condominiums.reduce((acc, c) => acc + c.lots, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Lots</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {tenant.condominiums.reduce((acc, c) => acc + c.owners, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Copropriétaires</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tenant.users.length}</div>
            <p className="text-sm text-muted-foreground">Utilisateurs</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Coordonnées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{tenant.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Téléphone</p>
              <p className="font-medium">{tenant.phone || "Non renseigné"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Adresse</p>
              <p className="font-medium">
                {tenant.address ? `${tenant.address}, ${tenant.postalCode} ${tenant.city}` : "Non renseignée"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Condominiums */}
      <Card>
        <CardHeader>
          <CardTitle>Copropriétés gérées</CardTitle>
          <CardDescription>
            Liste des immeubles gérés par ce gestionnaire
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead className="text-center">Lots</TableHead>
                <TableHead className="text-center">Copropriétaires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenant.condominiums.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Aucune copropriété
                  </TableCell>
                </TableRow>
              ) : (
                tenant.condominiums.map((condo) => (
                  <TableRow key={condo.id}>
                    <TableCell className="font-medium">{condo.name}</TableCell>
                    <TableCell>{condo.address}</TableCell>
                    <TableCell className="text-center">{condo.lots}</TableCell>
                    <TableCell className="text-center">{condo.owners}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Users */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
          <CardDescription>
            Équipe de gestion de ce cabinet
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenant.users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    Aucun utilisateur
                  </TableCell>
                </TableRow>
              ) : (
                tenant.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{roleLabels[user.role] || user.role}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
