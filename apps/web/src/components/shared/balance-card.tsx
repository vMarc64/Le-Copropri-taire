"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Euro, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";

interface BalanceCardProps {
  balance: number;
  label?: string;
  description?: string;
  showIcon?: boolean;
  className?: string;
  variant?: "default" | "compact";
}

export function BalanceCard({
  balance,
  label = "Solde",
  description,
  showIcon = true,
  className,
  variant = "default",
}: BalanceCardProps) {
  const isPositive = balance >= 0;
  const isZero = balance === 0;

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className={cn(
            "font-semibold",
            isZero
              ? "text-green-600 dark:text-green-500"
              : isPositive
              ? "text-muted-foreground"
              : "text-destructive"
          )}
        >
          {isZero ? "À jour" : `${balance.toLocaleString("fr-FR")} €`}
        </span>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {showIcon && (
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              isZero
                ? "bg-green-100 dark:bg-green-900/30"
                : isPositive
                ? "bg-muted"
                : "bg-destructive/10"
            )}
          >
            {isZero ? (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
            ) : isPositive ? (
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "text-2xl font-bold",
            isZero
              ? "text-green-600 dark:text-green-500"
              : isPositive
              ? "text-foreground"
              : "text-destructive"
          )}
        >
          {isZero ? "À jour" : `${balance.toLocaleString("fr-FR")} €`}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {!isZero && (
          <Badge
            variant={isPositive ? "secondary" : "destructive"}
            className="mt-2"
          >
            {isPositive ? "Créditeur" : "Débiteur"}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
