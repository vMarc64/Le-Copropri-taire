"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Building2, MapPin, Users, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

export interface Condominium {
  id: string;
  name: string;
  address: string;
  city?: string;
  postalCode?: string;
  lotsCount?: number;
  ownersCount?: number;
  balance?: number;
  status?: "active" | "pending" | "suspended";
  bankConnected?: boolean;
}

interface CondominiumCardProps {
  condominium: Condominium;
  href?: string;
  variant?: "default" | "compact" | "detailed";
  showBalance?: boolean;
  showStatus?: boolean;
  showBankStatus?: boolean;
  onClick?: () => void;
  className?: string;
}

const statusConfig = {
  active: { label: "Active", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  pending: { label: "En attente", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  suspended: { label: "Suspendue", className: "bg-destructive/10 text-destructive" },
};

export function CondominiumCard({
  condominium,
  href,
  variant = "default",
  showBalance = false,
  showStatus = false,
  showBankStatus = false,
  onClick,
  className,
}: CondominiumCardProps) {
  const fullAddress = [
    condominium.address,
    condominium.postalCode,
    condominium.city,
  ]
    .filter(Boolean)
    .join(", ");

  const content = (
    <Card
      className={cn(
        "transition-all duration-200",
        (href || onClick) && "cursor-pointer hover:border-primary/50 hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      {variant === "compact" ? (
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{condominium.name}</p>
                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {fullAddress}
                </p>
              </div>
            </div>
            {showBalance && condominium.balance !== undefined && (
              <div className="text-right">
                <p
                  className={cn(
                    "font-semibold",
                    condominium.balance === 0
                      ? "text-green-600"
                      : condominium.balance > 0
                      ? "text-muted-foreground"
                      : "text-destructive"
                  )}
                >
                  {condominium.balance === 0
                    ? "À jour"
                    : `${condominium.balance.toLocaleString("fr-FR")} €`}
                </p>
              </div>
            )}
            {(href || onClick) && (
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CardContent>
      ) : (
        <>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{condominium.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {fullAddress}
                  </CardDescription>
                </div>
              </div>
              {showStatus && condominium.status && (
                <Badge className={statusConfig[condominium.status].className}>
                  {statusConfig[condominium.status].label}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {condominium.lotsCount !== undefined && (
                <div>
                  <p className="text-2xl font-bold">{condominium.lotsCount}</p>
                  <p className="text-sm text-muted-foreground">Lots</p>
                </div>
              )}
              {condominium.ownersCount !== undefined && (
                <div>
                  <p className="text-2xl font-bold">{condominium.ownersCount}</p>
                  <p className="text-sm text-muted-foreground">Propriétaires</p>
                </div>
              )}
              {showBalance && condominium.balance !== undefined && (
                <div>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      condominium.balance === 0
                        ? "text-green-600"
                        : condominium.balance > 0
                        ? "text-foreground"
                        : "text-destructive"
                    )}
                  >
                    {condominium.balance === 0
                      ? "À jour"
                      : `${condominium.balance.toLocaleString("fr-FR")} €`}
                  </p>
                  <p className="text-sm text-muted-foreground">Solde</p>
                </div>
              )}
              {showBankStatus && (
                <div>
                  <div className="flex items-center gap-2">
                    {condominium.bankConnected ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-green-600">Connectée</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Non connectée</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Banque</p>
                </div>
              )}
            </div>
            {(href || onClick) && (
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" className="gap-2">
                  Voir détails <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
