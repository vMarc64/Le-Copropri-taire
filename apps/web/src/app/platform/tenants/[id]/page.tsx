"use client";

import { use } from "react";
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

// Mock data - will be replaced with API call
const mockTenant = {
  id: "1",
  name: "Syndic ABC",
  email: "contact@syndicabc.fr",
  siret: "12345678901234",
  phone: "01 23 45 67 89",
  address: "123 rue de Paris",
  city: "Paris",
  postalCode: "75001",
  status: "active" as const,
  createdAt: "2025-10-15",
  condominiums: [
    { id: "c1", name: "Résidence Les Lilas", address: "12 rue des Lilas, 75020 Paris", lots: 24, owners: 18 },
    { id: "c2", name: "Immeuble Haussmann", address: "45 bd Haussmann, 75009 Paris", lots: 36, owners: 28 },
    { id: "c3", name: "Le Parc des Roses", address: "8 allée des Roses, 92100 Boulogne", lots: 48, owners: 42 },
  ],
  users: [
    { id: "u1", name: "Jean Dupont", email: "jean.dupont@syndicabc.fr", role: "admin" },
    { id: "u2", name: "Marie Martin", email: "marie.martin@syndicabc.fr", role: "manager" },
    { id: "u3", name: "Pierre Durand", email: "pierre.durand@syndicabc.fr", role: "manager" },
  ],
};

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
  const tenant = mockTenant; // TODO: Fetch from API

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
              {tenant.condominiums.map((condo) => (
                <TableRow key={condo.id}>
                  <TableCell className="font-medium">{condo.name}</TableCell>
                  <TableCell>{condo.address}</TableCell>
                  <TableCell className="text-center">{condo.lots}</TableCell>
                  <TableCell className="text-center">{condo.owners}</TableCell>
                </TableRow>
              ))}
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
              {tenant.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{roleLabels[user.role] || user.role}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
