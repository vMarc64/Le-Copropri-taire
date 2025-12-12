"use client";

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

// Mock data for tenant portal
const tenantInfo = {
  name: "Mme Sophie Martin",
  email: "sophie.martin@email.com",
  condominium: "Résidence Les Lilas",
  address: "12 rue des Lilas, 75020 Paris",
  lot: { reference: "A12", type: "Appartement", floor: 1 },
  owner: "M. Jean Dupont",
  leaseStart: "01/09/2024",
};

const balanceInfo = {
  total: 0,
  nextRent: { amount: 850, dueDate: "01/01/2026" },
};

const recentPayments = [
  { id: "1", date: "01/12/2025", label: "Loyer Décembre 2025", amount: 850, status: "paid" },
  { id: "2", date: "01/11/2025", label: "Loyer Novembre 2025", amount: 850, status: "paid" },
  { id: "3", date: "01/10/2025", label: "Loyer Octobre 2025", amount: 850, status: "paid" },
];

const consumptions = {
  water: { current: 12, unit: "m³", icon: "💧" },
  heating: { current: 320, unit: "kWh", icon: "🔥" },
};

const documents = [
  { id: "1", name: "Quittance Décembre 2025.pdf", date: "01/12/2025" },
  { id: "2", name: "Quittance Novembre 2025.pdf", date: "01/11/2025" },
];

const announcements = [
  { id: "1", title: "Travaux ascenseur", date: "10/12/2025", content: "L'ascenseur sera en maintenance du 15 au 17 décembre." },
];

export default function TenantDashboardPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tenant" className="flex items-center gap-2">
              <span className="text-xl font-bold">🏠 Le Copropriétaire</span>
              <Badge variant="secondary">Locataire</Badge>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/tenant">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/tenant/payments">
              <Button variant="ghost" size="sm">Paiements</Button>
            </Link>
            <Link href="/tenant/documents">
              <Button variant="ghost" size="sm">Documents</Button>
            </Link>
            <Link href="/tenant/consumptions">
              <Button variant="ghost" size="sm">Consommations</Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <span className="text-sm text-muted-foreground">{tenantInfo.name}</span>
            <Link href="/login">
              <Button variant="outline" size="sm">Déconnexion</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <div className="space-y-6">
          {/* Welcome */}
          <div>
            <h1 className="text-3xl font-bold">Bonjour, {tenantInfo.name.split(' ')[1]} 👋</h1>
            <p className="text-muted-foreground">
              {tenantInfo.condominium} • Lot {tenantInfo.lot.reference} • {tenantInfo.lot.type}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-2xl font-bold ${balanceInfo.total === 0 ? "text-green-600" : "text-destructive"}`}>
                      {balanceInfo.total === 0 ? "À jour" : `${balanceInfo.total} €`}
                    </p>
                    <p className="text-sm text-muted-foreground">Solde actuel</p>
                  </div>
                  <span className="text-3xl">💰</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{balanceInfo.nextRent.amount} €</p>
                    <p className="text-sm text-muted-foreground">Prochain loyer ({balanceInfo.nextRent.dueDate})</p>
                  </div>
                  <span className="text-3xl">📅</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{consumptions.water.current} {consumptions.water.unit}</p>
                    <p className="text-sm text-muted-foreground">Eau ce mois</p>
                  </div>
                  <span className="text-3xl">{consumptions.water.icon}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{consumptions.heating.current} {consumptions.heating.unit}</p>
                    <p className="text-sm text-muted-foreground">Chauffage ce mois</p>
                  </div>
                  <span className="text-3xl">{consumptions.heating.icon}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Announcements */}
          {announcements.length > 0 && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">📢 Annonces de la copropriété</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="rounded-lg border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{announcement.title}</h4>
                      <span className="text-xs text-muted-foreground">{announcement.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Lease Info */}
            <Card>
              <CardHeader>
                <CardTitle>🔑 Mon logement</CardTitle>
                <CardDescription>Informations sur votre location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Lot</span>
                  <span className="font-medium">{tenantInfo.lot.reference} - {tenantInfo.lot.type}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Étage</span>
                  <span className="font-medium">{tenantInfo.lot.floor === 0 ? "RDC" : tenantInfo.lot.floor}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Propriétaire</span>
                  <span className="font-medium">{tenantInfo.owner}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Début du bail</span>
                  <span className="font-medium">{tenantInfo.leaseStart}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>💳 Derniers paiements</CardTitle>
                    <CardDescription>Historique de vos loyers</CardDescription>
                  </div>
                  <Link href="/tenant/payments">
                    <Button variant="outline" size="sm">Voir tout →</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Libellé</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell className="font-medium">{payment.label}</TableCell>
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

          {/* Documents & Actions */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Documents */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>📁 Mes quittances</CardTitle>
                    <CardDescription>Quittances de loyer</CardDescription>
                  </div>
                  <Link href="/tenant/documents">
                    <Button variant="outline" size="sm">Voir tout →</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg border">
                      <span className="flex items-center gap-2">
                        <span>📄</span>
                        <span className="text-sm font-medium">{doc.name}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{doc.date}</span>
                        <Button variant="ghost" size="sm">⬇️</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>⚡ Actions rapides</CardTitle>
                <CardDescription>Accès aux fonctionnalités principales</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Link href="/tenant/consumptions">
                  <Button className="w-full justify-start" variant="outline">
                    📊 Voir mes consommations
                  </Button>
                </Link>
                <Link href="/tenant/documents">
                  <Button className="w-full justify-start" variant="outline">
                    📄 Télécharger une quittance
                  </Button>
                </Link>
                <Link href="/tenant/contact">
                  <Button className="w-full justify-start" variant="outline">
                    📧 Contacter le propriétaire
                  </Button>
                </Link>
                <Link href="/tenant/profile">
                  <Button className="w-full justify-start" variant="outline">
                    👤 Modifier mes informations
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 Le Copropriétaire. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
