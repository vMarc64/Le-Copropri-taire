"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { 
  Clock, 
  Euro, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Building2,
  Loader2,
  CheckCircle2,
  Users
} from "lucide-react";
import { 
  getDashboardStats, 
  getCondominiumsWithUnpaid, 
  type DashboardStats, 
  type CondominiumWithUnpaid 
} from "@/lib/api";

function TrendBadge({ value, inverted = false }: { value: number; inverted?: boolean }) {
  const isPositive = inverted ? value < 0 : value > 0;
  const isNegative = inverted ? value > 0 : value < 0;
  
  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-medium ${
        isNegative
          ? "text-emerald-600 dark:text-emerald-400"
          : isPositive
          ? "text-rose-500 dark:text-rose-400"
          : "text-gray-500"
      }`}
    >
      {isNegative ? (
        <TrendingDown className="h-4 w-4" />
      ) : (
        <TrendingUp className="h-4 w-4" />
      )}
      {value > 0 ? "+" : ""}{value}%
    </span>
  );
}

export default function ManagerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    latePayments: 0,
    latePaymentsTrend: 0,
    totalUnpaid: 0,
    totalUnpaidTrend: 0,
    failedDirectDebits: 0,
    failedDirectDebitsTrend: 0,
  });
  const [condominiums, setCondominiums] = useState<CondominiumWithUnpaid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "up-to-date" | "late">("late");

  const filteredCondominiums = condominiums.filter((condo) => {
    if (filter === "all") return true;
    if (filter === "up-to-date") return condo.unpaidAmount === 0 && condo.ownersInArrears === 0;
    if (filter === "late") return condo.unpaidAmount > 0 || condo.ownersInArrears > 0;
    return true;
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [statsData, condosData] = await Promise.all([
          getDashboardStats(),
          getCondominiumsWithUnpaid(),
        ]);
        setStats(statsData);
        setCondominiums(condosData);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
    <div className="min-h-screen">
      <div className="mx-auto space-y-6 md:space-y-8 px-0 md:px-6 py-4 md:py-8 lg:px-8">
        {/* Header */}
        <div className="px-4 md:px-0">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-[14px] md:text-[15px] text-muted-foreground">Vue d&apos;ensemble de votre portefeuille immobilier</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4 md:px-0">
          {/* Late Payments */}
          <Card className="p-0">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 md:space-y-3">
                  <p className="text-[12px] md:text-[13px] font-medium text-muted-foreground">Retards de paiement</p>
                  <div className="flex items-baseline gap-2 md:gap-3">
                    <span className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                      {stats.latePayments}
                    </span>
                    <TrendBadge value={stats.latePaymentsTrend} />
                  </div>
                </div>
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Unpaid */}
          <Card className="p-0">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 md:space-y-3">
                  <p className="text-[12px] md:text-[13px] font-medium text-muted-foreground">Total impayés</p>
                  <div className="flex items-baseline gap-2 md:gap-3">
                    <span className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                      {stats.totalUnpaid.toLocaleString("fr-FR")} €
                    </span>
                    <TrendBadge value={stats.totalUnpaidTrend} inverted />
                  </div>
                </div>
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/10">
                  <Euro className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Failed Direct Debits */}
          <Card className="p-0 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 md:space-y-3">
                  <p className="text-[12px] md:text-[13px] font-medium text-muted-foreground">Prélèvements échoués</p>
                  <div className="flex items-baseline gap-2 md:gap-3">
                    <span className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                      {stats.failedDirectDebits}
                    </span>
                    <TrendBadge value={stats.failedDirectDebitsTrend} />
                  </div>
                </div>
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid - Responsive 2 columns on 2xl+ */}
        <div className="grid gap-6 md:gap-8 2xl:grid-cols-2 px-4 md:px-0">
          {/* Condominiums Section */}
          <div className="space-y-4 md:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base md:text-lg font-semibold text-foreground">Copropriétés</h2>
              <Button size="sm" className="h-9 gap-2 rounded-lg px-4 text-[13px] font-medium w-full sm:w-auto" asChild>
                <Link href="/app/condominiums/new">
                  <Plus className="h-4 w-4" />
                  Nouvelle copropriété
                </Link>
              </Button>
            </div>

            {/* Filter Tabs */}
            <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "up-to-date" | "late")} defaultValue="late">
              <TabsList className="w-full sm:w-auto flex">
                <TabsTrigger value="late" className="gap-1 sm:gap-2 data-[state=active]:!text-destructive flex-1 sm:flex-initial text-xs sm:text-sm">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">En retard</span> ({condominiums.filter(c => c.unpaidAmount > 0 || c.ownersInArrears > 0).length})
                </TabsTrigger>
                <TabsTrigger value="all" className="gap-1 sm:gap-2 flex-1 sm:flex-initial text-xs sm:text-sm">
                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Toutes</span> ({condominiums.length})
                </TabsTrigger>
                <TabsTrigger value="up-to-date" className="gap-1 sm:gap-2 data-[state=active]:!text-emerald-600 flex-1 sm:flex-initial text-xs sm:text-sm">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">À jour</span> ({condominiums.filter(c => c.unpaidAmount === 0 && c.ownersInArrears === 0).length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3">
              {filteredCondominiums.length === 0 ? (
                <Card className="p-6">
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      {filter === "all" && "Aucune copropriété"}
                      {filter === "up-to-date" && "Aucune copropriété à jour"}
                      {filter === "late" && "Aucune copropriété en retard"}
                    </p>
                  </div>
                </Card>
              ) : (
                filteredCondominiums.map((condo) => (
                  <Link key={condo.id} href={`/app/condominiums/${condo.id}`}>
                    <Card className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-foreground truncate">{condo.name}</p>
                          <p className="text-[13px] text-muted-foreground truncate">{condo.address}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`text-[13px] font-semibold ${condo.unpaidAmount > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                              {condo.unpaidAmount.toLocaleString("fr-FR")} €
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[12px] ${condo.ownersInArrears > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                              <Users className="h-3 w-3" />
                              {condo.ownersInArrears} en retard
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <Card className="overflow-hidden p-0 hidden md:block">
              <div className="overflow-x-auto">
                {/* Table Header */}
                <div className="grid min-w-[600px] grid-cols-12 gap-4 border-b border-border bg-muted/50 px-6 py-3">
                  <div className="col-span-4 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Copropriété
                  </div>
                  <div className="col-span-3 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Montant impayé
                  </div>
                  <div className="col-span-3 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Propriétaires en retard
                  </div>
                  <div className="col-span-2 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Prélèv. échoués
                  </div>
                </div>
                
                {/* Table Rows */}
                <div className="divide-y divide-border">
                  {filteredCondominiums.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Building2 className="h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-4 text-sm text-muted-foreground">
                        {filter === "all" && "Aucune copropriété"}
                        {filter === "up-to-date" && "Aucune copropriété à jour"}
                        {filter === "late" && "Aucune copropriété en retard"}
                      </p>
                    </div>
                  ) : (
                    filteredCondominiums.map((condo) => (
                    <Link
                      key={condo.id}
                      href={`/app/condominiums/${condo.id}`}
                      className="grid min-w-[600px] grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="col-span-4 flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-medium text-foreground">{condo.name}</p>
                          <p className="truncate text-[13px] text-muted-foreground">{condo.address}</p>
                        </div>
                      </div>
                      <div className="col-span-3 flex items-center justify-center">
                        <span className={`text-[14px] font-semibold ${condo.unpaidAmount > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                          {condo.unpaidAmount.toLocaleString("fr-FR")} €
                        </span>
                      </div>
                      <div className="col-span-3 flex items-center justify-center">
                        <span className={`inline-flex h-7 min-w-[28px] items-center justify-center rounded-full px-2.5 text-[13px] font-medium ${condo.ownersInArrears > 0 ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'}`}>
                          {condo.ownersInArrears}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <span className={`inline-flex h-7 min-w-[28px] items-center justify-center rounded-full px-2.5 text-[13px] font-medium ${condo.failedDirectDebits > 0 ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'}`}>
                          {condo.failedDirectDebits}
                        </span>
                      </div>
                    </Link>
                  ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Bank Analysis Section - Placeholder */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Transactions à analyser</h2>
            </div>
            <Card className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Euro className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm font-medium text-foreground">Aucune transaction à analyser</p>
                <p className="mt-1 text-sm text-muted-foreground">Les transactions non associées apparaîtront ici</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
