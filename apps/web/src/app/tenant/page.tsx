"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  Euro,
  Calendar,
  Droplets,
  Flame,
  Home,
  User,
  FileText,
  CreditCard,
  AlertCircle,
  Clock,
  ChevronRight,
  Megaphone,
  Key,
  Building2,
} from "lucide-react";

// Mock data for tenant portal
const tenantInfo = {
  firstName: "Marie",
  name: "Mme Marie Martin",
  email: "marie.martin@email.com",
  condominium: "Résidence Les Lilas",
  address: "12 rue des Lilas, 75020 Paris",
  lot: { reference: "B12", type: "Appartement T3", floor: 2, surface: "65 m²" },
  owner: "M. Jean Dupont",
  leaseStart: "01/09/2024",
  rent: 950,
  charges: 120,
};

const balanceInfo = {
  total: 0,
  nextRent: { amount: 1070, dueDate: "01/01/2026", label: "Loyer + charges Janvier 2026" },
};

const recentPayments = [
  { id: "1", date: "01/12/2025", label: "Loyer + charges Décembre", amount: 1070, status: "paid" as const },
  { id: "2", date: "01/11/2025", label: "Loyer + charges Novembre", amount: 1070, status: "paid" as const },
  { id: "3", date: "01/10/2025", label: "Loyer + charges Octobre", amount: 1070, status: "paid" as const },
];

const consumptions = {
  water: { current: 12, previous: 11, unit: "m³" },
  heating: { current: 320, previous: 280, unit: "kWh" },
};

const recentDocuments = [
  { id: "1", name: "Quittance Décembre 2025", date: "01/12/2025", type: "quittance" },
  { id: "2", name: "Quittance Novembre 2025", date: "01/11/2025", type: "quittance" },
  { id: "3", name: "Avis d'échéance Janvier 2026", date: "15/12/2025", type: "avis" },
];

const announcements = [
  { id: "1", title: "Travaux ascenseur", date: "10/12/2025", content: "L'ascenseur sera en maintenance du 15 au 17 décembre.", priority: "info" as const },
  { id: "2", title: "Collecte des encombrants", date: "08/12/2025", content: "Prochaine collecte le 20 décembre. Déposez vos encombrants la veille au soir.", priority: "info" as const },
];

export default function TenantDashboardPage() {
  const getVariation = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const waterVariation = getVariation(consumptions.water.current, consumptions.water.previous);
  const heatingVariation = getVariation(consumptions.heating.current, consumptions.heating.previous);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">Bonjour, {tenantInfo.firstName} 👋</h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          {tenantInfo.condominium} • Lot {tenantInfo.lot.reference}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${balanceInfo.total === 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                {balanceInfo.total === 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <p className={`text-2xl font-bold ${balanceInfo.total === 0 ? "text-green-600" : "text-red-600"}`}>
                  {balanceInfo.total === 0 ? "À jour" : `${balanceInfo.total} €`}
                </p>
                <p className="text-xs text-muted-foreground">Solde actuel</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{balanceInfo.nextRent.amount} €</p>
                <p className="text-xs text-muted-foreground">Prochain loyer ({balanceInfo.nextRent.dueDate})</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-cyan-100 dark:bg-cyan-900/30 p-2">
                <Droplets className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{consumptions.water.current} {consumptions.water.unit}</p>
                <p className="text-xs text-muted-foreground">
                  Eau ce mois 
                  <span className={waterVariation > 0 ? "text-red-500" : "text-green-500"}>
                    {" "}({waterVariation > 0 ? "+" : ""}{waterVariation.toFixed(0)}%)
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-2">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{consumptions.heating.current} {consumptions.heating.unit}</p>
                <p className="text-xs text-muted-foreground">
                  Chauffage ce mois
                  <span className={heatingVariation > 0 ? "text-red-500" : "text-green-500"}>
                    {" "}({heatingVariation > 0 ? "+" : ""}{heatingVariation.toFixed(0)}%)
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <Card className="border-purple-500/30 bg-purple-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-purple-600" />
              Annonces de la copropriété
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="rounded-lg border bg-background p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{announcement.title}</h4>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {announcement.date}
                  </span>
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
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Mon logement
            </CardTitle>
            <CardDescription>Informations sur votre location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Lot</span>
              <span className="font-medium">{tenantInfo.lot.reference} - {tenantInfo.lot.type}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Surface</span>
              <span className="font-medium">{tenantInfo.lot.surface}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Étage</span>
              <span className="font-medium">{tenantInfo.lot.floor === 0 ? "RDC" : `${tenantInfo.lot.floor}ème étage`}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Propriétaire</span>
              <span className="font-medium">{tenantInfo.owner}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Début du bail</span>
              <span className="font-medium">{tenantInfo.leaseStart}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Loyer mensuel</span>
              <span className="font-medium">{tenantInfo.rent} € + {tenantInfo.charges} € charges</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Derniers paiements
                </CardTitle>
                <CardDescription>Historique de vos loyers</CardDescription>
              </div>
              <Link href="/tenant/payments">
                <Button variant="ghost" size="sm" className="gap-1">
                  Voir tout <ChevronRight className="h-4 w-4" />
                </Button>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-muted-foreground">{payment.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        {payment.label}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{payment.amount} €</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents récents
              </CardTitle>
              <CardDescription>Quittances et avis d&apos;échéance</CardDescription>
            </div>
            <Link href="/tenant/documents">
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="rounded bg-muted p-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-4">
            <Link href="/tenant/payments">
              <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
                <CreditCard className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium">Payer mon loyer</p>
                  <p className="text-xs text-muted-foreground">Réglez votre loyer en ligne</p>
                </div>
              </Button>
            </Link>
            <Link href="/tenant/documents">
              <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Mes quittances</p>
                  <p className="text-xs text-muted-foreground">Télécharger les quittances</p>
                </div>
              </Button>
            </Link>
            <Link href="/tenant/consumptions">
              <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
                <Droplets className="h-5 w-5 text-cyan-600" />
                <div className="text-left">
                  <p className="font-medium">Consommations</p>
                  <p className="text-xs text-muted-foreground">Suivre eau et chauffage</p>
                </div>
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
              <User className="h-5 w-5 text-purple-600" />
              <div className="text-left">
                <p className="font-medium">Contacter</p>
                <p className="text-xs text-muted-foreground">Écrire au propriétaire</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
