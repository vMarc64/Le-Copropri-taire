"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  Settings,
  Landmark,
  FileText,
  UserPlus,
  List,
} from "lucide-react";

// Mock data
const mockCondominium = {
  id: "1",
  name: "Résidence Les Lilas",
  address: "12 rue des Lilas, Paris 75020",
  currentBalance: 45230,
  balanceTrend: 8,
  ownersInArrears: 3,
  monthlyIncome: 12500,
  incomeTrend: 15,
};

const recentActivities = [
  {
    id: "1",
    type: "payment",
    title: "Paiement reçu de M. Dupont",
    details: "Lot A12 • 850 € • Il y a 2 heures",
    color: "bg-emerald-500", // Success - stays green
  },
  {
    id: "2",
    type: "overdue",
    title: "Paiement en retard - Mme Martin",
    details: "Lot B03 • 1 200 € • Depuis 1 jour",
    color: "bg-destructive", // Error/Warning - uses theme destructive
  },
  {
    id: "3",
    type: "document",
    title: "Nouveau document ajouté",
    details: "Budget Annuel 2025.pdf • Il y a 3 jours",
    color: "bg-primary", // Uses theme primary color
  },
];

const quickActions = [
  {
    title: "Compte bancaire & Transactions",
    description: "Voir et gérer les transactions",
    icon: Landmark,
    href: "bank",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    title: "Ajouter un document",
    description: "Télécharger contrats et fichiers",
    icon: FileText,
    href: "documents",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    title: "Gérer Propriétaires / Locataires",
    description: "Ajouter ou modifier les informations",
    icon: UserPlus,
    href: "owners",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    title: "Liste des propriétaires",
    description: "Voir tous les propriétaires et leur statut",
    icon: List,
    href: "owners",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
];

function TrendBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
      <TrendingUp className="h-4 w-4" />
      +{value}%
    </span>
  );
}

export default function CondominiumDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const condo = mockCondominium;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-10 px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {condo.name}
              </h1>
              <p className="mt-0.5 text-[15px] text-muted-foreground">
                {condo.address}
              </p>
            </div>
          </div>
          <Button variant="outline" className="h-10 gap-2 rounded-lg border-border px-4 text-[13px] font-medium" asChild>
            <Link href={`/app/condominiums/${id}/settings`}>
              <Settings className="h-4 w-4" />
              Paramètres
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Current Balance */}
          <Card className="p-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                  <DollarSign className="h-6 w-6 text-emerald-500" />
                </div>
                <TrendBadge value={condo.balanceTrend} />
              </div>
              <div className="mt-5">
                <p className="text-[13px] font-medium text-muted-foreground">Solde actuel</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                  {condo.currentBalance.toLocaleString("fr-FR")} €
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Owners in Arrears */}
          <Card className="p-0">
            <CardContent className="p-6">
              <div className="flex items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                  <Users className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <div className="mt-5">
                <p className="text-[13px] font-medium text-muted-foreground">Propriétaires en retard</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                  {condo.ownersInArrears}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Income */}
          <Card className="p-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <TrendBadge value={condo.incomeTrend} />
              </div>
              <div className="mt-5">
                <p className="text-[13px] font-medium text-muted-foreground">Revenus mensuels</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                  {condo.monthlyIncome.toLocaleString("fr-FR")} €
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-0">
          <CardContent className="p-6">
            <h3 className="text-[15px] font-semibold text-foreground">Actions rapides</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={`/app/condominiums/${id}/${action.href}`}
                    className="flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.iconBg}`}>
                      <Icon className={`h-5 w-5 ${action.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-foreground">{action.title}</p>
                      <p className="mt-0.5 text-[13px] text-muted-foreground">{action.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="p-0">
          <CardContent className="p-6">
            <h3 className="text-[15px] font-semibold text-foreground">Activité récente</h3>
            <div className="mt-5 space-y-5">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${activity.color}`} />
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-foreground">{activity.title}</p>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">{activity.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
