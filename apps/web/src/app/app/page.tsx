import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Clock, 
  Euro, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Building2
} from "lucide-react";

// Mock data - will be replaced with API calls
const stats = {
  latePayments: 11,
  latePaymentsTrend: 12,
  totalUnpaid: 17250,
  totalUnpaidTrend: -5,
  failedDirectDebits: 8,
  failedDirectDebitsTrend: 3,
};

const condominiums = [
  {
    id: "1",
    name: "Résidence Les Lilas",
    address: "123 rue des Lilas, Paris 75011",
    latePayments: 4,
    unpaidAmount: 5200,
    ownersInArrears: 3,
  },
  {
    id: "2",
    name: "Immeuble Haussmann",
    address: "45 boulevard Haussmann, Paris 75009",
    latePayments: 3,
    unpaidAmount: 4800,
    ownersInArrears: 2,
  },
  {
    id: "3",
    name: "Le Parc des Roses",
    address: "78 avenue du Parc, Lyon 69003",
    latePayments: 2,
    unpaidAmount: 3200,
    ownersInArrears: 2,
  },
  {
    id: "4",
    name: "Les Jardins du Sud",
    address: "12 chemin des Jardins, Marseille 13008",
    latePayments: 2,
    unpaidAmount: 4050,
    ownersInArrears: 1,
  },
];

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
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-10 px-6 py-8 lg:px-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-[15px] text-muted-foreground">Vue d&apos;ensemble de votre portefeuille immobilier</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Late Payments */}
          <Card className="p-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-[13px] font-medium text-muted-foreground">Retards de paiement</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-semibold tracking-tight text-foreground">
                      {stats.latePayments}
                    </span>
                    <TrendBadge value={stats.latePaymentsTrend} />
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Unpaid */}
          <Card className="p-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-[13px] font-medium text-muted-foreground">Total impayés</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-semibold tracking-tight text-foreground">
                      {stats.totalUnpaid.toLocaleString("fr-FR")} €
                    </span>
                    <TrendBadge value={stats.totalUnpaidTrend} inverted />
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Euro className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Failed Direct Debits */}
          <Card className="p-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-[13px] font-medium text-muted-foreground">Prélèvements échoués</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-semibold tracking-tight text-foreground">
                      {stats.failedDirectDebits}
                    </span>
                    <TrendBadge value={stats.failedDirectDebitsTrend} />
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Condominiums Section */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Copropriétés avec impayés</h2>
            <Button size="sm" className="h-9 gap-2 rounded-lg px-4 text-[13px] font-medium" asChild>
              <Link href="/app/condominiums/new">
                <Plus className="h-4 w-4" />
                Créer une copropriété
              </Link>
            </Button>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              {/* Table Header */}
              <div className="grid min-w-[600px] grid-cols-12 gap-4 border-b border-border bg-muted/50 px-6 py-3">
                <div className="col-span-5 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Copropriété
                </div>
                <div className="col-span-2 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Retards
                </div>
                <div className="col-span-3 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Montant impayé
                </div>
                <div className="col-span-2 text-center text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Propriétaires en retard
                </div>
              </div>
              
              {/* Table Rows */}
              <div className="divide-y divide-border">
                {condominiums.map((condo) => (
                  <Link
                    key={condo.id}
                    href={`/app/condominiums/${condo.id}`}
                    className="grid min-w-[600px] grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-medium text-foreground">{condo.name}</p>
                        <p className="truncate text-[13px] text-muted-foreground">{condo.address}</p>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-secondary px-2.5 text-[13px] font-medium text-secondary-foreground">
                        {condo.latePayments}
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center justify-center">
                      <span className="text-[14px] font-semibold text-destructive">
                        {condo.unpaidAmount.toLocaleString("fr-FR")} €
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-[14px] text-muted-foreground">{condo.ownersInArrears}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
