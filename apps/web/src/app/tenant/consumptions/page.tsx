"use client";

import { useState, useEffect } from "react";
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
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Info,
  Lightbulb,
  ThermometerSun,
  Loader2,
} from "lucide-react";

interface ConsumptionHistory {
  month: string;
  value: number;
}

interface ConsumptionData {
  current: number;
  previous: number;
  average: number;
  unit: string;
  icon: typeof Droplets;
  color: string;
  label: string;
  description: string;
  costPerUnit: number;
  history: ConsumptionHistory[];
}

type ConsumptionType = "water" | "heating";

export default function TenantConsumptionsPage() {
  const [period, setPeriod] = useState<string>("6");
  const [activeTab, setActiveTab] = useState<ConsumptionType>("water");
  const [consumptions, setConsumptions] = useState<Record<ConsumptionType, ConsumptionData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConsumptions() {
      try {
        setLoading(true);
        // TODO: Fetch from API
        setConsumptions(null);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des consommations");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchConsumptions();
  }, []);

  const getVariation = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getHistoryByPeriod = (history: ConsumptionHistory[]) => {
    const months = parseInt(period);
    return history.slice(0, months);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; darkBg: string; bar: string }> = {
      cyan: { bg: "bg-cyan-100", text: "text-cyan-600", darkBg: "dark:bg-cyan-900/30", bar: "#06b6d4" },
      orange: { bg: "bg-orange-100", text: "text-orange-600", darkBg: "dark:bg-orange-900/30", bar: "#f97316" },
    };
    return colors[color] || colors.cyan;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!consumptions) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Mes consommations
          </h1>
          <p className="text-muted-foreground">
            Suivez vos consommations d&apos;eau et de chauffage
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Aucune donnée de consommation disponible</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcul du coût estimé
  const estimatedCosts = {
    water: consumptions.water.current * consumptions.water.costPerUnit,
    heating: consumptions.heating.current * consumptions.heating.costPerUnit,
  };
  const totalEstimatedCost = estimatedCosts.water + estimatedCosts.heating;

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
            Suivez vos consommations d&apos;eau et de chauffage
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
                  {data.previous > 0 && (
                    <Badge variant={isUp ? "destructive" : "default"} className="gap-1">
                      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(variation).toFixed(0)}%
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {data.current}
                  <span className="text-lg font-normal text-muted-foreground ml-1">{data.unit}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ce mois-ci • ~{(data.current * data.costPerUnit).toFixed(2)} €
                </p>
              </CardContent>
            </Card>
          );
        })}
        
        {/* Estimated Total Cost Card */}
        <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="rounded-full p-1.5 bg-purple-100 dark:bg-purple-900/30">
                <ThermometerSun className="h-4 w-4 text-purple-600" />
              </div>
              Coût estimé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
              {totalEstimatedCost.toFixed(2)}
              <span className="text-lg font-normal ml-1">€</span>
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
              Estimation mensuelle
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed View with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Historique détaillé</CardTitle>
          <CardDescription>Visualisez l&apos;évolution de vos consommations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ConsumptionType)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="water" className="gap-2">
                <Droplets className="h-4 w-4" />
                Eau
              </TabsTrigger>
              <TabsTrigger value="heating" className="gap-2">
                <Flame className="h-4 w-4" />
                Chauffage
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
                    <p className="text-xs text-muted-foreground mt-1">
                      Prix unitaire: {data.costPerUnit.toFixed(2)} € / {data.unit}
                    </p>
                  </div>
                  
                  {/* Bar Chart */}
                  <div className="space-y-3">
                    {history.map((item, index) => {
                      const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                      const isCurrentMonth = index === 0;
                      const cost = item.value * data.costPerUnit;
                      
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <span className={`text-sm w-24 ${isCurrentMonth ? "font-medium" : "text-muted-foreground"}`}>
                            {item.month}
                          </span>
                          <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden relative">
                            <div 
                              className={`h-full rounded-full transition-all ${isCurrentMonth ? "opacity-100" : "opacity-70"}`}
                              style={{ width: `${percentage}%`, backgroundColor: colorClasses.bar }}
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
                          <div className={`text-sm w-28 text-right ${isCurrentMonth ? "font-medium" : ""}`}>
                            <span>{item.value} {data.unit}</span>
                            <span className="text-xs text-muted-foreground ml-1">({cost.toFixed(0)}€)</span>
                          </div>
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

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Conseils économies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800">
            <Droplets className="h-5 w-5 text-cyan-600 mt-0.5" />
            <div>
              <p className="font-medium text-cyan-700 dark:text-cyan-400">Eau</p>
              <p className="text-sm text-cyan-600 dark:text-cyan-300 mt-1">
                Privilégiez les douches aux bains. Une douche de 5 minutes consomme ~60L contre ~150L pour un bain.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
            <Flame className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-orange-700 dark:text-orange-400">Chauffage</p>
              <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                Baissez le chauffage de 1°C permet d&apos;économiser ~7% sur la facture. Pensez à aérer 5 min/jour.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">À propos des relevés</p>
              <p className="text-sm text-muted-foreground mt-1">
                Les consommations affichées sont basées sur les relevés de compteurs individuels. 
                Les charges de copropriété (eau chaude, chauffage collectif) sont réparties selon les tantièmes 
                et incluses dans vos charges locatives mensuelles.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
