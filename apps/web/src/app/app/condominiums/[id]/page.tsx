"use client";

import { use, useEffect, useState } from "react";
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
  Loader2,
} from "lucide-react";
import { getCondominium, type Condominium } from "@/lib/api";

interface Activity {
  id: string;
  type: string;
  title: string;
  details: string;
  color: string;
}

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
    title: "Gérer Propriétaires",
    description: "Ajouter ou modifier les informations",
    icon: UserPlus,
    href: "owners",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    title: "Liste des lots",
    description: "Voir tous les lots de la copropriété",
    icon: List,
    href: "lots",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
];

export default function CondominiumDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [condominium, setCondominium] = useState<Condominium | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getCondominium(id);
        setCondominium(data);
        setActivities([]); // TODO: Fetch activities from API
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement de la copropriété");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !condominium) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error || "Copropriété non trouvée"}</p>
        <Button asChild>
          <Link href="/app/condominiums">Retour aux copropriétés</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{condominium.name}</h1>
            <p className="text-muted-foreground">{condominium.address}, {condominium.postalCode} {condominium.city}</p>
          </div>
        </div>
        <Link href={`/app/condominiums/${id}/settings`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Paramètres
          </Button>
        </Link>
      </div>

      {/* Stats Cards - Uniform height */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Solde actuel",
            value: `${condominium.balance.toLocaleString("fr-FR")} €`,
            icon: DollarSign,
            valueClass: condominium.balance < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "Lots",
            value: condominium.lots.toString(),
            icon: Building2,
          },
          {
            label: "Propriétaires",
            value: condominium.owners.toString(),
            icon: Users,
          },
          {
            label: "SEPA",
            value: condominium.sepaEnabled ? "Actif" : "Inactif",
            icon: Landmark,
            valueClass: condominium.sepaEnabled ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
          },
        ].map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold tabular-nums ${stat.valueClass || ""}`}>
                    {stat.value}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions - Grid with consistent sizing */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Actions rapides</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={`/app/condominiums/${id}/${action.href}`}>
              <Card className="group h-full cursor-pointer border-transparent bg-muted/50 transition-all hover:border-primary/30 hover:bg-muted">
                <CardContent className="flex h-full flex-col p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-medium leading-tight">{action.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Activité récente</h2>
        <Card>
          {activities.length === 0 ? (
            <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
              Aucune activité récente
            </CardContent>
          ) : (
            <CardContent className="divide-y p-0">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 px-4 py-3">
                  <div className={`h-2 w-2 shrink-0 rounded-full ${activity.color}`} />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.details}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
