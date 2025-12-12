"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const consumptions = {
  water: {
    current: 45,
    previous: 42,
    unit: "m³",
    icon: "💧",
    label: "Eau",
    history: [
      { month: "Déc 2025", value: 45 },
      { month: "Nov 2025", value: 42 },
      { month: "Oct 2025", value: 38 },
      { month: "Sep 2025", value: 35 },
      { month: "Août 2025", value: 48 },
      { month: "Juil 2025", value: 52 },
    ],
  },
  heating: {
    current: 1250,
    previous: 1180,
    unit: "kWh",
    icon: "🔥",
    label: "Chauffage",
    history: [
      { month: "Déc 2025", value: 1250 },
      { month: "Nov 2025", value: 1180 },
      { month: "Oct 2025", value: 850 },
      { month: "Sep 2025", value: 320 },
      { month: "Août 2025", value: 0 },
      { month: "Juil 2025", value: 0 },
    ],
  },
  electricity: {
    current: 285,
    previous: 270,
    unit: "kWh",
    icon: "⚡",
    label: "Électricité (parties communes)",
    history: [
      { month: "Déc 2025", value: 285 },
      { month: "Nov 2025", value: 270 },
      { month: "Oct 2025", value: 245 },
      { month: "Sep 2025", value: 220 },
      { month: "Août 2025", value: 195 },
      { month: "Juil 2025", value: 180 },
    ],
  },
};

const ownerInfo = {
  name: "M. Jean Dupont",
};

export default function ConsumptionsPage() {
  const [period, setPeriod] = useState("6months");

  const getVariation = (current: number, previous: number) => {
    const diff = ((current - previous) / previous) * 100;
    return diff.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/portal" className="flex items-center gap-2">
              <span className="text-xl font-bold">🏠 Le Copropriétaire</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/portal">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/portal/payments">
              <Button variant="ghost" size="sm">Paiements</Button>
            </Link>
            <Link href="/portal/documents">
              <Button variant="ghost" size="sm">Documents</Button>
            </Link>
            <Link href="/portal/consumptions">
              <Button variant="default" size="sm">Consommations</Button>
            </Link>
            <Link href="/portal/sepa">
              <Button variant="ghost" size="sm">Mandat SEPA</Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <span className="text-sm text-muted-foreground">{ownerInfo.name}</span>
            <Link href="/login">
              <Button variant="outline" size="sm">Déconnexion</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">📊 Mes consommations</h1>
              <p className="text-muted-foreground">
                Suivez vos consommations d&apos;eau, chauffage et électricité
              </p>
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">3 derniers mois</SelectItem>
                <SelectItem value="6months">6 derniers mois</SelectItem>
                <SelectItem value="12months">12 derniers mois</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(consumptions).map(([key, data]) => {
              const variation = parseFloat(getVariation(data.current, data.previous));
              return (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span>{data.icon}</span>
                      {data.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold">
                          {data.current} <span className="text-lg font-normal text-muted-foreground">{data.unit}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">Ce mois-ci</p>
                      </div>
                      <Badge variant={variation > 0 ? "destructive" : "default"}>
                        {variation > 0 ? "↑" : "↓"} {Math.abs(variation)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Consumption Cards with History */}
          {Object.entries(consumptions).map(([key, data]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{data.icon}</span>
                  {data.label}
                </CardTitle>
                <CardDescription>Historique de consommation</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Simple bar chart representation */}
                <div className="space-y-3">
                  {data.history.map((item, index) => {
                    const maxValue = Math.max(...data.history.map(h => h.value));
                    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground w-24">{item.month}</span>
                        <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-20 text-right">
                          {item.value} {data.unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Info Box */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-medium">Conseil économie d&apos;énergie</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Votre consommation de chauffage est supérieure à la moyenne de l&apos;immeuble. 
                    Pensez à purger vos radiateurs et à vérifier l&apos;isolation de vos fenêtres.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
