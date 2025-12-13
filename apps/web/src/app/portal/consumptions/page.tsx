"use client";

import { useState, useEffect } from "react";
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
  history: ConsumptionHistory[];
}

interface Tip {
  type: string;
  icon: typeof Flame;
  title: string;
  description: string;
  color: string;
}

type ConsumptionType = "water" | "heating" | "electricity";

export default function ConsumptionsPage() {
  const [period, setPeriod] = useState<string>("6");
  const [activeTab, setActiveTab] = useState<ConsumptionType>("water");
  const [consumptions, setConsumptions] = useState<Record<ConsumptionType, ConsumptionData> | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API calls
        setConsumptions(null);
        setTips([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    const colors: Record<string, { bg: string; text: string; darkBg: string }> = {
      blue: { bg: "bg-blue-100", text: "text-blue-600", darkBg: "dark:bg-blue-900/30" },
      orange: { bg: "bg-orange-100", text: "text-orange-600", darkBg: "dark:bg-orange-900/30" },
      yellow: { bg: "bg-yellow-100", text: "text-yellow-600", darkBg: "dark:bg-yellow-900/30" },
      green: { bg: "bg-green-100", text: "text-green-600", darkBg: "dark:bg-green-900/30" },
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  if (!consumptions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <BarChart3 className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Aucune donnée de consommation disponible</p>
      </div>
    );
  }

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
