"use client";

import { use, useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  label: string;
  amount: number;
  type: "credit" | "debit";
  status: "matched" | "pending";
  matchedTo: string | null;
}

interface PendingPayment {
  id: string;
  owner: string;
  lot: string;
  amount: number;
  dueDate: string;
  type: string;
}

interface BankInfo {
  bankName: string;
  iban: string;
  bic: string;
  balance: number;
  lastSync: string;
}

export default function BankPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: condoId } = use(params);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isMatchOpen, setIsMatchOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // TODO: Fetch from API
        setBankInfo(null);
        setTransactions([]);
        setPendingPayments([]);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des données bancaires");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [condoId]);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.label.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    balance: bankInfo?.balance ?? 0,
    pending: transactions.filter(t => t.status === "pending").length,
    matched: transactions.filter(t => t.status === "matched").length,
    credits: transactions.filter(t => t.type === "credit").reduce((sum, t) => sum + t.amount, 0),
  };

  const openMatchDialog = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsMatchOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

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
              {bankInfo ? `${bankInfo.bankName} • Dernière synchro: ${bankInfo.lastSync}` : "Aucun compte connecté"}
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
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Aucune transaction trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => (
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
                  ))
                )}
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
                    {transactions.filter(t => t.status === "pending").length === 0 ? (
                      <p className="text-muted-foreground text-sm">Aucune transaction en attente</p>
                    ) : (
                      transactions.filter(t => t.status === "pending").map(tx => (
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
                      ))
                    )}
                  </div>
                </div>

                {/* Pending Payments */}
                <div>
                  <h3 className="font-semibold mb-4">Paiements en attente ({pendingPayments.length})</h3>
                  <div className="space-y-2">
                    {pendingPayments.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Aucun paiement en attente</p>
                    ) : (
                      pendingPayments.map(payment => (
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
                      ))
                    )}
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
                {pendingPayments.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Aucun paiement en attente</p>
                ) : (
                  pendingPayments.map(payment => (
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
                  ))
                )}
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
