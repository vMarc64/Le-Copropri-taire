"use client";

import { use, useState } from "react";
import Link from "next/link";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const bankInfo = {
  bankName: "Crédit Mutuel",
  iban: "FR76 1234 5678 9012 3456 7890 123",
  bic: "CMCIFRPP",
  balance: 45680.50,
  lastSync: "12/12/2025 14:30",
};

const transactions = [
  { id: "1", date: "12/12/2025", label: "VIR SEPA M. DUPONT", amount: 450, type: "credit", status: "matched", matchedTo: "Appel T4 - A12" },
  { id: "2", date: "11/12/2025", label: "VIR SEPA MME MARTIN", amount: 380, type: "credit", status: "matched", matchedTo: "Appel T4 - A13" },
  { id: "3", date: "10/12/2025", label: "PRLV EDF COPRO LILAS", amount: -245.80, type: "debit", status: "matched", matchedTo: "Facture EDF" },
  { id: "4", date: "08/12/2025", label: "VIR INCONNU REF123", amount: 520, type: "credit", status: "pending", matchedTo: null },
  { id: "5", date: "05/12/2025", label: "CHQ 1234567", amount: 380, type: "credit", status: "pending", matchedTo: null },
  { id: "6", date: "01/12/2025", label: "PRLV ASSURANCE MMA", amount: -890.00, type: "debit", status: "matched", matchedTo: "Assurance annuelle" },
];

const pendingPayments = [
  { id: "1", owner: "M. Bernard", lot: "B03", amount: 520, dueDate: "01/12/2025", type: "call" },
  { id: "2", owner: "M. Leroy", lot: "C02", amount: 380, dueDate: "01/12/2025", type: "call" },
];

export default function BankPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: condoId } = use(params);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isMatchOpen, setIsMatchOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<typeof transactions[0] | null>(null);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.label.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    balance: bankInfo.balance,
    pending: transactions.filter(t => t.status === "pending").length,
    matched: transactions.filter(t => t.status === "matched").length,
    credits: transactions.filter(t => t.type === "credit").reduce((sum, t) => sum + t.amount, 0),
  };

  const openMatchDialog = (tx: typeof transactions[0]) => {
    setSelectedTransaction(tx);
    setIsMatchOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/app/condominiums/${condoId}`}>
            <Button variant="ghost" size="sm">← Retour</Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">🏦 Suivi bancaire</h1>
            <p className="text-muted-foreground">
              {bankInfo.bankName} • Dernière synchro: {bankInfo.lastSync}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">🔄 Synchroniser</Button>
          <Button variant="outline">📥 Importer relevé</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-green-600">{stats.balance.toLocaleString('fr-FR')} €</p>
            <p className="text-sm text-muted-foreground">Solde actuel</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">À rapprocher</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{stats.matched}</p>
            <p className="text-sm text-muted-foreground">Rapprochées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">+{stats.credits.toLocaleString('fr-FR')} €</p>
            <p className="text-sm text-muted-foreground">Encaissements</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Link href={`/app/condominiums/${condoId}`}>
          <Button variant="ghost" size="sm">📊 Dashboard</Button>
        </Link>
        <Link href={`/app/condominiums/${condoId}/lots`}>
          <Button variant="ghost" size="sm">🚪 Lots</Button>
        </Link>
        <Link href={`/app/condominiums/${condoId}/owners`}>
          <Button variant="ghost" size="sm">👥 Propriétaires</Button>
        </Link>
        <Link href={`/app/condominiums/${condoId}/bank`}>
          <Button variant="default" size="sm">🏦 Banque</Button>
        </Link>
        <Link href={`/app/condominiums/${condoId}/documents`}>
          <Button variant="ghost" size="sm">📁 Documents</Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">📋 Transactions</TabsTrigger>
          <TabsTrigger value="reconciliation">🔗 Rapprochement</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <Input
              placeholder="Rechercher une transaction..."
              className="max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="matched">Rapprochées</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Rapproché à</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{tx.label}</TableCell>
                    <TableCell className={`text-right font-medium ${tx.type === "credit" ? "text-green-600" : "text-destructive"}`}>
                      {tx.type === "credit" ? "+" : ""}{tx.amount.toLocaleString('fr-FR')} €
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.status === "matched" ? "default" : "secondary"}>
                        {tx.status === "matched" ? "✓ Rapprochée" : "En attente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tx.matchedTo || "-"}
                    </TableCell>
                    <TableCell>
                      {tx.status === "pending" && (
                        <Button variant="ghost" size="sm" onClick={() => openMatchDialog(tx)}>
                          🔗 Rapprocher
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🔗 Rapprochement bancaire</CardTitle>
              <CardDescription>
                Associez les transactions bancaires aux paiements attendus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Pending Transactions */}
                <div>
                  <h3 className="font-semibold mb-4">Transactions à rapprocher ({transactions.filter(t => t.status === "pending").length})</h3>
                  <div className="space-y-2">
                    {transactions.filter(t => t.status === "pending").map(tx => (
                      <div 
                        key={tx.id}
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                        onClick={() => openMatchDialog(tx)}
                      >
                        <div>
                          <p className="font-medium text-sm">{tx.label}</p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                        <span className={`font-semibold ${tx.type === "credit" ? "text-green-600" : "text-destructive"}`}>
                          {tx.type === "credit" ? "+" : ""}{tx.amount} €
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Payments */}
                <div>
                  <h3 className="font-semibold mb-4">Paiements en attente ({pendingPayments.length})</h3>
                  <div className="space-y-2">
                    {pendingPayments.map(payment => (
                      <div 
                        key={payment.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">{payment.owner} - {payment.lot}</p>
                          <p className="text-xs text-muted-foreground">Échéance: {payment.dueDate}</p>
                        </div>
                        <span className="font-semibold">{payment.amount} €</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Match Dialog */}
      <Dialog open={isMatchOpen} onOpenChange={setIsMatchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rapprocher la transaction</DialogTitle>
            <DialogDescription>
              Associez cette transaction à un paiement attendu
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="py-4">
              <div className="p-4 bg-muted rounded-lg mb-4">
                <p className="font-medium">{selectedTransaction.label}</p>
                <p className="text-sm text-muted-foreground">{selectedTransaction.date}</p>
                <p className={`text-lg font-bold ${selectedTransaction.type === "credit" ? "text-green-600" : "text-destructive"}`}>
                  {selectedTransaction.type === "credit" ? "+" : ""}{selectedTransaction.amount} €
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Sélectionnez le paiement correspondant:</p>
                {pendingPayments.map(payment => (
                  <div 
                    key={payment.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-sm">{payment.owner} - {payment.lot}</p>
                      <p className="text-xs text-muted-foreground">Appel de fonds</p>
                    </div>
                    <span className="font-semibold">{payment.amount} €</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMatchOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => setIsMatchOpen(false)}>
              Valider le rapprochement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
