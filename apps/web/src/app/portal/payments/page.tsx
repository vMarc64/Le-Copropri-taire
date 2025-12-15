"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  Euro,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  paidAmount: number;
  date: string;
  dueDate: string;
  label: string;
  status: string;
  type: string;
  condominiumId: string;
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
  paid: {
    label: "Payé",
    icon: CheckCircle,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  pending: {
    label: "En attente",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  partial: {
    label: "Partiel",
    icon: AlertCircle,
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  overdue: {
    label: "En retard",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive",
  },
  cancelled: {
    label: "Annulé",
    icon: XCircle,
    className: "bg-muted text-muted-foreground",
  },
};

const typeLabels: Record<string, string> = {
  sepa: "Prélèvement SEPA",
  card: "Carte bancaire",
  transfer: "Virement",
  check: "Chèque",
  cash: "Espèces",
};

export default function PortalPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/portal/payments");
      
      if (!response.ok) {
        throw new Error("Impossible de charger les paiements");
      }

      const data = await response.json();
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.label.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesYear = yearFilter === "all" || payment.dueDate.includes(yearFilter);
    return matchesSearch && matchesStatus && matchesYear;
  });

  // Get unique years from payments
  const years = [...new Set(payments.map(p => new Date(p.dueDate).getFullYear()))].sort((a, b) => b - a);

  // Calculate stats
  const stats = {
    totalPaid: payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0),
    totalPending: payments.filter(p => ["pending", "partial", "overdue"].includes(p.status)).reduce((sum, p) => sum + p.amount - p.paidAmount, 0),
    paymentsCount: payments.length,
    pendingCount: payments.filter(p => ["pending", "partial", "overdue"].includes(p.status)).length,
  };

  const openPayDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPayDialogOpen(true);
  };

  if (loading) {
    return <LoadingState message="Chargement de vos paiements..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchPayments} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Mes paiements</h1>
        <p className="text-muted-foreground mt-1">
          Historique et suivi de vos appels de charges
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalPaid.toLocaleString("fr-FR")} €
                </p>
                <p className="text-sm text-muted-foreground">Total payé</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn(
                  "text-2xl font-bold",
                  stats.totalPending > 0 ? "text-destructive" : "text-green-600"
                )}>
                  {stats.totalPending === 0 ? "À jour" : `${stats.totalPending.toLocaleString("fr-FR")} €`}
                </p>
                <p className="text-sm text-muted-foreground">Reste à payer</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Euro className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.paymentsCount}</p>
                <p className="text-sm text-muted-foreground">Appels de fonds</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn(
                  "text-2xl font-bold",
                  stats.pendingCount > 0 ? "text-yellow-600" : "text-green-600"
                )}>
                  {stats.pendingCount}
                </p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="paid">Payés</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="overdue">En retard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Aucun paiement"
          description={search || statusFilter !== "all" ? "Aucun paiement ne correspond à vos critères" : "Vous n'avez pas encore de paiements"}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historique</CardTitle>
            <CardDescription>
              {filteredPayments.length} paiement{filteredPayments.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mobile view */}
            <div className="space-y-3 md:hidden">
              {filteredPayments.map((payment) => {
                const status = statusConfig[payment.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                const isPending = ["pending", "partial", "overdue"].includes(payment.status);
                
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", status.className)}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.label}</p>
                        <p className="text-sm text-muted-foreground">
                          Échéance : {new Date(payment.dueDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{payment.amount.toLocaleString("fr-FR")} €</p>
                      {isPending ? (
                        <Button size="sm" className="mt-2" onClick={() => openPayDialog(payment)}>
                          Payer
                        </Button>
                      ) : (
                        <Badge className={status.className}>{status.label}</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop view */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const status = statusConfig[payment.status] || statusConfig.pending;
                    const isPending = ["pending", "partial", "overdue"].includes(payment.status);
                    
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.dueDate).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="font-medium">{payment.label}</TableCell>
                        <TableCell>
                          {payment.type ? typeLabels[payment.type] || payment.type : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={status.className}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {payment.amount.toLocaleString("fr-FR")} €
                        </TableCell>
                        <TableCell className="text-right">
                          {isPending && (
                            <Button size="sm" onClick={() => openPayDialog(payment)}>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Payer
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pay Dialog */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payer par carte bancaire</DialogTitle>
            <DialogDescription>
              Réglez votre appel de charges en toute sécurité
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Libellé</span>
                  <span className="font-medium">{selectedPayment.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Échéance</span>
                  <span>{new Date(selectedPayment.dueDate).toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Montant</span>
                  <span className="font-bold text-primary">
                    {(selectedPayment.amount - selectedPayment.paidAmount).toLocaleString("fr-FR")} €
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p>Le paiement sera effectué via Stripe, notre partenaire de paiement sécurisé.</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => {
              // TODO: Integrate Stripe checkout
              alert("Redirection vers Stripe...");
              setIsPayDialogOpen(false);
            }}>
              <CreditCard className="h-4 w-4 mr-2" />
              Payer maintenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
