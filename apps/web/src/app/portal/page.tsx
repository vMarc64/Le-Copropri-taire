"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  BalanceCard,
  PaymentHistory,
  DocumentList,
  CondominiumCard,
  LoadingState,
  ErrorState,
  EmptyState,
  type Payment,
  type Document,
  type Condominium,
} from "@/components/shared";
import {
  Building2,
  Calendar,
  CreditCard,
  Landmark,
  FileText,
  BarChart3,
  DoorOpen,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface DashboardData {
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  condominiums: {
    id: string;
    name: string;
    address: string;
    city: string;
    postalCode: string;
    balance: number;
    lotsCount: number;
    sepaActive: boolean;
  }[];
  totalBalance: number;
  nextPayment: {
    id: string;
    amount: number;
    dueDate: string;
    description: string;
    condominiumName: string;
  } | null;
  recentPayments: {
    id: string;
    date: string;
    label: string;
    amount: number;
    status: string;
    type: string;
  }[];
  recentDocuments: {
    id: string;
    name: string;
    type: string;
    date: string;
  }[];
  lots: {
    id: string;
    reference: string;
    type: string;
    floor: number | null;
    surface: number | null;
    tantiemes: number | null;
    condominiumId: string;
    condominiumName: string;
  }[];
}

export default function PortalDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/portal/dashboard");
      
      if (!response.ok) {
        throw new Error("Impossible de charger les données");
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Chargement de votre espace..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  if (!data) {
    return (
      <EmptyState
        icon={Building2}
        title="Aucune copropriété"
        description="Vous n'êtes associé à aucune copropriété pour le moment."
      />
    );
  }

  const { owner, condominiums, totalBalance, nextPayment, recentPayments, recentDocuments, lots } = data;

  // Map payments to shared component format
  const formattedPayments: Payment[] = recentPayments.map(p => ({
    id: p.id,
    date: p.date,
    label: p.label,
    amount: p.amount,
    status: p.status as Payment["status"],
    type: p.type as Payment["type"],
  }));

  // Map documents to shared component format
  const formattedDocuments: Document[] = recentDocuments.map(d => ({
    id: d.id,
    name: d.name,
    type: d.type as Document["type"],
    date: d.date,
  }));

  // Check if any condominium has active SEPA
  const hasActiveSepa = condominiums.some(c => c.sepaActive);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          Bonjour, {owner.firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue dans votre espace copropriétaire
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Balance */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-xl md:text-2xl font-bold ${
                    totalBalance === 0
                      ? "text-green-600 dark:text-green-500"
                      : totalBalance > 0
                      ? "text-foreground"
                      : "text-destructive"
                  }`}
                >
                  {totalBalance === 0 ? "À jour" : `${totalBalance.toLocaleString("fr-FR")} €`}
                </p>
                <p className="text-sm text-muted-foreground">Solde global</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                {totalBalance === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-primary" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Payment */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                {nextPayment ? (
                  <>
                    <p className="text-xl md:text-2xl font-bold">
                      {nextPayment.amount.toLocaleString("fr-FR")} €
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Prochain appel ({new Date(nextPayment.dueDate).toLocaleDateString("fr-FR")})
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xl md:text-2xl font-bold text-green-600">Aucun</p>
                    <p className="text-sm text-muted-foreground">Prochain appel</p>
                  </>
                )}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lots Count */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl md:text-2xl font-bold">{lots.length}</p>
                <p className="text-sm text-muted-foreground">
                  {lots.length > 1 ? "Lots" : "Lot"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <DoorOpen className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEPA Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                {hasActiveSepa ? (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    ✓ Actif
                  </Badge>
                ) : (
                  <Badge variant="secondary">Non configuré</Badge>
                )}
                <p className="text-sm text-muted-foreground mt-1">Mandat SEPA</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Landmark className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Condominiums */}
      {condominiums.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Mes copropriétés</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {condominiums.map((condo) => (
              <CondominiumCard
                key={condo.id}
                condominium={{
                  id: condo.id,
                  name: condo.name,
                  address: condo.address,
                  city: condo.city,
                  postalCode: condo.postalCode,
                  balance: condo.balance,
                  lotsCount: condo.lotsCount,
                }}
                variant="compact"
                showBalance
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DoorOpen className="h-5 w-5" />
              Mes lots
            </CardTitle>
            <CardDescription>Lots dont vous êtes propriétaire</CardDescription>
          </CardHeader>
          <CardContent>
            {lots.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun lot associé
              </p>
            ) : (
              <>
                {/* Mobile view */}
                <div className="space-y-3 md:hidden">
                  {lots.map((lot) => (
                    <div
                      key={lot.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-semibold">{lot.reference}</p>
                        <p className="text-sm text-muted-foreground">
                          {lot.type} • {lot.condominiumName}
                        </p>
                      </div>
                      {lot.tantiemes && (
                        <Badge variant="secondary">{lot.tantiemes} ‰</Badge>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop view */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Référence</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Surface</TableHead>
                        <TableHead>Tantièmes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lots.map((lot) => (
                        <TableRow key={lot.id}>
                          <TableCell className="font-medium">{lot.reference}</TableCell>
                          <TableCell className="capitalize">{lot.type}</TableCell>
                          <TableCell>
                            {lot.surface ? `${lot.surface} m²` : "-"}
                          </TableCell>
                          <TableCell>
                            {lot.tantiemes ? `${lot.tantiemes} ‰` : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <PaymentHistory
          payments={formattedPayments}
          title="Derniers paiements"
          showViewAll
          viewAllHref="/portal/payments"
          maxItems={5}
        />
      </div>

      {/* Documents & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Documents */}
        <DocumentList
          documents={formattedDocuments}
          title="Documents récents"
          showViewAll
          viewAllHref="/portal/documents"
          maxItems={4}
          variant="compact"
        />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions rapides</CardTitle>
            <CardDescription>Accès aux fonctionnalités principales</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild variant="outline" className="justify-start gap-3 h-12">
              <Link href="/portal/payments">
                <CreditCard className="h-5 w-5" />
                Payer par carte bancaire
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-3 h-12">
              <Link href="/portal/sepa">
                <Landmark className="h-5 w-5" />
                Gérer mon mandat SEPA
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-3 h-12">
              <Link href="/portal/documents">
                <FileText className="h-5 w-5" />
                Consulter les documents
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-3 h-12">
              <Link href="/portal/consumptions">
                <BarChart3 className="h-5 w-5" />
                Voir mes consommations
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
