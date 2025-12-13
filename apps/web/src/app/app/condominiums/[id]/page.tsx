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

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Solde actuel</p>
                <p className={`text-2xl font-bold ${condominium.balance < 0 ? 'text-destructive' : ''}`}>
                  {condominium.balance.toLocaleString("fr-FR")} €
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nombre de lots</p>
                <p className="text-2xl font-bold">{condominium.lots}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Propriétaires</p>
                <p className="text-2xl font-bold">{condominium.owners}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SEPA</p>
                <p className="text-2xl font-bold">{condominium.sepaEnabled ? "Actif" : "Inactif"}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Landmark className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Actions rapides</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={`/app/condominiums/${id}/${action.href}`}>
              <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.iconBg}`}>
                      <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                    </div>
                    <div>
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Activité récente</h2>
        {activities.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucune activité récente
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="divide-y p-0">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4">
                  <div className={`h-2 w-2 rounded-full ${activity.color}`} />
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
