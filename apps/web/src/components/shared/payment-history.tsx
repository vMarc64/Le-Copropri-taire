"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowRight, CreditCard, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

export interface Payment {
  id: string;
  date: string;
  label: string;
  amount: number;
  status: "paid" | "pending" | "failed" | "cancelled";
  type?: "sepa" | "card" | "transfer" | "cash";
}

interface PaymentHistoryProps {
  payments: Payment[];
  title?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
  maxItems?: number;
  variant?: "table" | "cards";
  className?: string;
}

const statusConfig = {
  paid: {
    label: "Payé",
    variant: "default" as const,
    icon: CheckCircle,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  pending: {
    label: "En attente",
    variant: "secondary" as const,
    icon: Clock,
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  failed: {
    label: "Échoué",
    variant: "destructive" as const,
    icon: XCircle,
    className: "bg-destructive/10 text-destructive",
  },
  cancelled: {
    label: "Annulé",
    variant: "outline" as const,
    icon: AlertCircle,
    className: "bg-muted text-muted-foreground",
  },
};

const typeLabels = {
  sepa: "Prélèvement SEPA",
  card: "Carte bancaire",
  transfer: "Virement",
  cash: "Espèces",
};

export function PaymentHistory({
  payments,
  title = "Historique des paiements",
  showViewAll = false,
  viewAllHref = "/payments",
  maxItems,
  variant = "table",
  className,
}: PaymentHistoryProps) {
  const displayedPayments = maxItems ? payments.slice(0, maxItems) : payments;

  if (payments.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Aucun paiement</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "cards") {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {showViewAll && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={viewAllHref}>
                Voir tout <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {displayedPayments.map((payment) => {
            const status = statusConfig[payment.status];
            const StatusIcon = status.icon;
            return (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", status.className)}>
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{payment.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString("fr-FR")}
                      {payment.type && ` • ${typeLabels[payment.type]}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{payment.amount.toLocaleString("fr-FR")} €</p>
                  <Badge className={status.className}>{status.label}</Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        {showViewAll && (
          <Button variant="ghost" size="sm" asChild>
            <Link href={viewAllHref}>
              Voir tout <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {/* Mobile view */}
        <div className="space-y-3 md:hidden">
          {displayedPayments.map((payment) => {
            const status = statusConfig[payment.status];
            const StatusIcon = status.icon;
            return (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-full", status.className)}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{payment.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <p className="font-semibold">{payment.amount.toLocaleString("fr-FR")} €</p>
              </div>
            );
          })}
        </div>
        
        {/* Desktop view */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Libellé</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedPayments.map((payment) => {
                const status = statusConfig[payment.status];
                return (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.date).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="font-medium">{payment.label}</TableCell>
                    <TableCell>
                      {payment.type ? typeLabels[payment.type] : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.className}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {payment.amount.toLocaleString("fr-FR")} €
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
