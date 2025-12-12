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

// Mock data
const mockCondominium = {
  id: "1",
  name: "Résidence Les Lilas",
  address: "12 rue des Lilas",
  city: "Paris",
  postalCode: "75020",
  description: "Belle résidence des années 80 avec jardin privatif",
  siret: "12345678901234",
  sepaEnabled: true,
  cbEnabled: true,
  lots: 24,
  owners: 18,
  tenants: 6,
  balance: 12500,
  unpaidAmount: 2300,
};

const recentPayments = [
  { id: "1", owner: "M. Dupont", lot: "A12", amount: 450, date: "12/12/2025", status: "paid" },
  { id: "2", owner: "Mme Martin", lot: "B03", amount: 380, date: "11/12/2025", status: "paid" },
  { id: "3", owner: "M. Bernard", lot: "C08", amount: 520, date: "05/12/2025", status: "overdue" },
];

const quickStats = [
  { label: "Lots", value: 24, icon: "🚪" },
  { label: "Propriétaires", value: 18, icon: "👥" },
  { label: "Locataires", value: 6, icon: "🔑" },
  { label: "Solde", value: "12.5k €", icon: "💰", color: "text-green-600" },
];

export default function CondominiumDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const condo = mockCondominium; // TODO: Fetch from API

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app/condominiums">
            <Button variant="ghost" size="sm">← Retour</Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{condo.name}</h1>
              {condo.sepaEnabled && <Badge>SEPA</Badge>}
              {condo.cbEnabled && <Badge variant="secondary">CB</Badge>}
            </div>
            <p className="text-muted-foreground">
              {condo.address}, {condo.postalCode} {condo.city}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/app/condominiums/${id}/settings`}>
            <Button variant="outline">⚙️ Paramètres</Button>
          </Link>
          <Link href={`/app/condominiums/${id}/call`}>
            <Button>📨 Nouvel appel</Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className={`text-2xl font-bold ${stat.color || ""}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Link href={`/app/condominiums/${id}`}>
          <Button variant="default" size="sm">📊 Dashboard</Button>
        </Link>
        <Link href={`/app/condominiums/${id}/lots`}>
          <Button variant="ghost" size="sm">🚪 Lots</Button>
        </Link>
        <Link href={`/app/condominiums/${id}/owners`}>
          <Button variant="ghost" size="sm">👥 Propriétaires</Button>
        </Link>
        <Link href={`/app/condominiums/${id}/bank`}>
          <Button variant="ghost" size="sm">🏦 Banque</Button>
        </Link>
        <Link href={`/app/condominiums/${id}/documents`}>
          <Button variant="ghost" size="sm">📁 Documents</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>⚠️ Alertes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <span className="text-sm">3 impayés en retard (&gt;30 jours)</span>
              <Link href={`/app/condominiums/${id}/payments?filter=overdue`}>
                <Button variant="ghost" size="sm">Voir →</Button>
              </Link>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3">
              <span className="text-sm">2 mandats SEPA en attente de signature</span>
              <Link href={`/app/condominiums/${id}/sepa`}>
                <Button variant="ghost" size="sm">Voir →</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>💳 Derniers paiements</CardTitle>
              <Link href={`/app/condominiums/${id}/payments`} className="text-sm text-primary hover:underline">
                Voir tout →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Lot</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.owner}</TableCell>
                    <TableCell>{payment.lot}</TableCell>
                    <TableCell className="text-right">{payment.amount} €</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === "paid" ? "default" : "destructive"}>
                        {payment.status === "paid" ? "Payé" : "Impayé"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href={`/app/condominiums/${id}/lots/new`}>
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-3 pt-6">
              <span className="text-2xl">🚪</span>
              <span className="font-medium">Ajouter un lot</span>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/app/condominiums/${id}/owners/new`}>
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-3 pt-6">
              <span className="text-2xl">👥</span>
              <span className="font-medium">Ajouter propriétaire</span>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/app/condominiums/${id}/documents/upload`}>
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-3 pt-6">
              <span className="text-2xl">📁</span>
              <span className="font-medium">Ajouter document</span>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/app/condominiums/${id}/call`}>
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center gap-3 pt-6">
              <span className="text-2xl">📨</span>
              <span className="font-medium">Appel de fonds</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
