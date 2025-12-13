"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface Payment {
  id: string;
  date: string;
  label: string;
  amount: number;
  status: string;
  method: string;
  reference: string;
}

interface PendingPayment {
  id: string;
  dueDate: string;
  label: string;
  amount: number;
  reference: string;
}

export default function PaymentsHistoryPage() {
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API calls
        setPayments([]);
        setPendingPayments([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    if (yearFilter === "all") return true;
    return payment.date.includes(yearFilter);
  });

  const stats = {
    totalPaid: payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0),
    paymentsCount: payments.length,
    pending: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
  };

  const openPayDialog = (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setIsPayOpen(true);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">💳 Mes paiements</h1>
          <p className="text-muted-foreground">
            Historique et suivi de vos paiements
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-green-600">{stats.totalPaid.toLocaleString('fr-FR')} €</p>
            <p className="text-sm text-muted-foreground">Total payé</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{stats.paymentsCount}</p>
            <p className="text-sm text-muted-foreground">Paiements effectués</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className={`text-2xl font-bold ${stats.pending > 0 ? "text-yellow-600" : "text-green-600"}`}>
              {stats.pending > 0 ? `${stats.pending} €` : "À jour"}
            </p>
            <p className="text-sm text-muted-foreground">En attente</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="text-base">⏳ Paiements à venir</CardTitle>
            <CardDescription>Appels de fonds en attente de paiement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border bg-background">
                  <div>
                    <p className="font-medium">{payment.label}</p>
                    <p className="text-sm text-muted-foreground">
                      Échéance: {payment.dueDate} • Réf: {payment.reference}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold">{payment.amount} €</span>
                    <Button onClick={() => openPayDialog(payment)}>
                      💳 Payer par CB
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Année" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les années</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">📥 Exporter CSV</Button>
      </div>

      {/* Payments History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Libellé</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                  <TableCell className="font-medium">{payment.label}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{payment.method}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{payment.amount} €</TableCell>
                  <TableCell>
                    <Badge variant={payment.status === "paid" ? "default" : "destructive"}>
                      {payment.status === "paid" ? "✓ Payé" : "Impayé"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">📄 Reçu</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pay Dialog */}
      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>💳 Paiement par carte bancaire</DialogTitle>
            <DialogDescription>
              Réglez votre appel de fonds de manière sécurisée
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="py-4">
              <div className="p-4 bg-muted rounded-lg mb-4">
                <p className="font-medium">{selectedPayment.label}</p>
                <p className="text-sm text-muted-foreground">Réf: {selectedPayment.reference}</p>
                <p className="text-2xl font-bold mt-2">{selectedPayment.amount} €</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Numéro de carte</label>
                  <Input placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Date d&apos;expiration</label>
                    <Input placeholder="MM/AA" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">CVV</label>
                    <Input placeholder="123" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                🔒 Paiement sécurisé par Stripe. Vos données bancaires ne sont pas stockées.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => setIsPayOpen(false)}>
              Payer {selectedPayment?.amount} €
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
