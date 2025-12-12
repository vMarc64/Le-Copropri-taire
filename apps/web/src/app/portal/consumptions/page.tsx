"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Droplets,
  Flame,
  Zap,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  BarChart3,
  Calendar,
  Info,
} from "lucide-react";

// Mock data - Consommations
const consumptions = {
  water: {
    current: 45,
    previous: 42,
    average: 40,
    unit: "m³",
    icon: Droplets,
    color: "blue",
    label: "Eau",
    description: "Consommation d'eau froide et chaude",
    history: [
      { month: "Déc 2025", value: 45 },
      { month: "Nov 2025", value: 42 },
      { month: "Oct 2025", value: 38 },
      { month: "Sep 2025", value: 35 },
      { month: "Août 2025", value: 48 },
      { month: "Juil 2025", value: 52 },
      { month: "Juin 2025", value: 44 },
      { month: "Mai 2025", value: 40 },
      { month: "Avr 2025", value: 38 },
      { month: "Mar 2025", value: 36 },
      { month: "Fév 2025", value: 34 },
      { month: "Jan 2025", value: 32 },
    ],
  },
  heating: {
    current: 1250,
    previous: 1180,
    average: 1100,
    unit: "kWh",
    icon: Flame,
    color: "orange",
    label: "Chauffage",
    description: "Chauffage collectif",
    history: [
      { month: "Déc 2025", value: 1250 },
      { month: "Nov 2025", value: 1180 },
      { month: "Oct 2025", value: 850 },
      { month: "Sep 2025", value: 320 },
      { month: "Août 2025", value: 0 },
      { month: "Juil 2025", value: 0 },
      { month: "Juin 2025", value: 0 },
      { month: "Mai 2025", value: 180 },
      { month: "Avr 2025", value: 450 },
      { month: "Mar 2025", value: 980 },
      { month: "Fév 2025", value: 1350 },
      { month: "Jan 2025", value: 1480 },
    ],
  },
  electricity: {
    current: 285,
    previous: 270,
    average: 250,
    unit: "kWh",
    icon: Zap,
    color: "yellow",
    label: "Électricité",
    description: "Parties communes (éclairage, ascenseur)",
    history: [
      { month: "Déc 2025", value: 285 },
      { month: "Nov 2025", value: 270 },
      { month: "Oct 2025", value: 245 },
      { month: "Sep 2025", value: 220 },
      { month: "Août 2025", value: 195 },
      { month: "Juil 2025", value: 180 },
      { month: "Juin 2025", value: 190 },
      { month: "Mai 2025", value: 210 },
      { month: "Avr 2025", value: 230 },
      { month: "Mar 2025", value: 255 },
      { month: "Fév 2025", value: 275 },
      { month: "Jan 2025", value: 290 },
    ],
  },
};

// Conseils personnalisés
const tips = [
  {
    type: "heating",
    icon: Flame,
    title: "Chauffage au-dessus de la moyenne",
    description: "Votre consommation de chauffage est 14% supérieure à la moyenne de l'immeuble. Pensez à purger vos radiateurs et vérifier l'isolation de vos fenêtres.",
    color: "orange",
  },
  {
    type: "water",
    icon: Droplets,
    title: "Bonne gestion de l'eau",
    description: "Votre consommation d'eau est proche de la moyenne. Continuez à adopter les bons gestes !",
    color: "green",
  },
];

type ConsumptionType = keyof typeof consumptions;

export default function ConsumptionsPage() {
  const [period, setPeriod] = useState<string>("6");
  const [activeTab, setActiveTab] = useState<ConsumptionType>("water");

  const getVariation = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getHistoryByPeriod = (history: typeof consumptions.water.history) => {
    const months = parseInt(period);
    return history.slice(0, months);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; darkBg: string }> = {
      blue: { bg: "bg-blue-100", text: "text-blue-600", darkBg: "dark:bg-blue-900/30" },
      orange: { bg: "bg-orange-100", text: "text-orange-600", darkBg: "dark:bg-orange-900/30" },
      yellow: { bg: "bg-yellow-100", text: "text-yellow-600", darkBg: "dark:bg-yellow-900/30" },
      green: { bg: "bg-green-100", text: "text-green-600", darkBg: "dark:bg-green-900/30" },
    };
    return colors[color] || colors.blue;
  };

  const totalAnnual = Object.values(consumptions).reduce((acc, data) => {
    const yearTotal = data.history.reduce((sum, h) => sum + h.value, 0);
    return acc + yearTotal;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Mes consommations
          </h1>
          <p className="text-muted-foreground">
            Suivez vos consommations d&apos;eau, chauffage et électricité
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 derniers mois</SelectItem>
            <SelectItem value="6">6 derniers mois</SelectItem>
            <SelectItem value="12">12 derniers mois</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {(Object.entries(consumptions) as [ConsumptionType, typeof consumptions.water][]).map(([key, data]) => {
          const variation = getVariation(data.current, data.previous);
          const isUp = variation > 0;
          const colorClasses = getColorClasses(data.color);
          const Icon = data.icon;
          
          return (
            <Card 
              key={key} 
              className={`cursor-pointer transition-colors ${activeTab === key ? "border-primary" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <div className={`rounded-full p-1.5 ${colorClasses.bg} ${colorClasses.darkBg}`}>
                      <Icon className={`h-4 w-4 ${colorClasses.text}`} />
                    </div>
                    {data.label}
                  </span>
                  <Badge variant={isUp ? "destructive" : "default"} className="gap-1">
                    {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(variation).toFixed(1)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {data.current.toLocaleString("fr-FR")}
                  <span className="text-lg font-normal text-muted-foreground ml-1">{data.unit}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ce mois-ci • Moyenne: {data.average} {data.unit}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed View with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Historique détaillé</CardTitle>
          <CardDescription>Visualisez l&apos;évolution de vos consommations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ConsumptionType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="water" className="gap-2">
                <Droplets className="h-4 w-4" />
                <span className="hidden sm:inline">Eau</span>
              </TabsTrigger>
              <TabsTrigger value="heating" className="gap-2">
                <Flame className="h-4 w-4" />
                <span className="hidden sm:inline">Chauffage</span>
              </TabsTrigger>
              <TabsTrigger value="electricity" className="gap-2">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Électricité</span>
              </TabsTrigger>
            </TabsList>

            {(Object.entries(consumptions) as [ConsumptionType, typeof consumptions.water][]).map(([key, data]) => {
              const history = getHistoryByPeriod(data.history);
              const maxValue = Math.max(...history.map(h => h.value));
              const colorClasses = getColorClasses(data.color);

              return (
                <TabsContent key={key} value={key} className="mt-6">
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">{data.description}</p>
                  </div>
                  
                  {/* Bar Chart */}
                  <div className="space-y-3">
                    {history.map((item, index) => {
                      const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                      const isCurrentMonth = index === 0;
                      
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <span className={`text-sm w-24 ${isCurrentMonth ? "font-medium" : "text-muted-foreground"}`}>
                            {item.month}
                          </span>
                          <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden relative">
                            <div 
                              className={`h-full rounded-full transition-all ${colorClasses.bg.replace("100", "500")} ${isCurrentMonth ? "opacity-100" : "opacity-70"}`}
                              style={{ width: `${percentage}%`, backgroundColor: data.color === "blue" ? "#3b82f6" : data.color === "orange" ? "#f97316" : "#eab308" }}
                            />
                            {/* Average line */}
                            {maxValue > 0 && (
                              <div 
                                className="absolute top-0 bottom-0 w-0.5 bg-foreground/30"
                                style={{ left: `${(data.average / maxValue) * 100}%` }}
                                title={`Moyenne: ${data.average} ${data.unit}`}
                              />
                            )}
                          </div>
                          <span className={`text-sm w-24 text-right ${isCurrentMonth ? "font-medium" : ""}`}>
                            {item.value.toLocaleString("fr-FR")} {data.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-foreground/30" />
                      <span>Moyenne: {data.average} {data.unit}</span>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Tips & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Conseils personnalisés
          </CardTitle>
          <CardDescription>Recommandations basées sur vos consommations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tips.map((tip, index) => {
            const colorClasses = getColorClasses(tip.color);
            const Icon = tip.icon;
            
            return (
              <div key={index} className={`flex items-start gap-3 p-4 rounded-lg border ${tip.color === "green" ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"}`}>
                <div className={`rounded-full p-2 ${colorClasses.bg} ${colorClasses.darkBg}`}>
                  <Icon className={`h-4 w-4 ${colorClasses.text}`} />
                </div>
                <div>
                  <p className="font-medium">{tip.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">À propos de vos consommations</p>
              <p className="text-sm text-muted-foreground mt-1">
                Les données affichées sont basées sur les relevés effectués par les prestataires de la copropriété. 
                En cas de question, contactez le syndic via la messagerie du portail.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
