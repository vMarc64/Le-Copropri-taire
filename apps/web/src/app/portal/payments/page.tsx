"use client";

import Link from "next/link";
import { useState } from "react";
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

// Mock data
const payments = [
  { id: "1", date: "01/12/2025", label: "Appel de fonds T4 2025", amount: 450, status: "paid", method: "SEPA", reference: "AF-2025-T4" },
  { id: "2", date: "01/09/2025", label: "Appel de fonds T3 2025", amount: 450, status: "paid", method: "SEPA", reference: "AF-2025-T3" },
  { id: "3", date: "01/06/2025", label: "Appel de fonds T2 2025", amount: 450, status: "paid", method: "CB", reference: "AF-2025-T2" },
  { id: "4", date: "01/03/2025", label: "Appel de fonds T1 2025", amount: 450, status: "paid", method: "SEPA", reference: "AF-2025-T1" },
  { id: "5", date: "01/12/2024", label: "Appel de fonds T4 2024", amount: 420, status: "paid", method: "SEPA", reference: "AF-2024-T4" },
  { id: "6", date: "01/09/2024", label: "Appel de fonds T3 2024", amount: 420, status: "paid", method: "SEPA", reference: "AF-2024-T3" },
];

const pendingPayments = [
  { id: "pending-1", dueDate: "01/01/2026", label: "Appel de fonds T1 2026", amount: 450, reference: "AF-2026-T1" },
];

const ownerInfo = {
  name: "M. Jean Dupont",
};

export default function PaymentsHistoryPage() {
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<typeof pendingPayments[0] | null>(null);

  const filteredPayments = payments.filter((payment) => {
    if (yearFilter === "all") return true;
    return payment.date.includes(yearFilter);
  });

  const stats = {
    totalPaid: payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0),
    paymentsCount: payments.length,
    pending: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
  };

  const openPayDialog = (payment: typeof pendingPayments[0]) => {
    setSelectedPayment(payment);
    setIsPayOpen(true);
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
              <Button variant="default" size="sm">Paiements</Button>
            </Link>
            <Link href="/portal/documents">
              <Button variant="ghost" size="sm">Documents</Button>
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
        </div>
      </main>

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

      {/* Footer */}
      <footer className="border-t py-6 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 Le Copropriétaire. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
