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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Landmark,
  Wallet,
  Clock,
  CheckCircle,
  TrendingUp,
  Search,
  RefreshCw,
  Upload,
  MoreHorizontal,
  Link2,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  ListChecks,
  CreditCard,
} from "lucide-react";

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
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Suivi bancaire</h1>
            <p className="text-sm text-muted-foreground">
              {bankInfo ? `${bankInfo.bankName} • Dernière synchro: ${bankInfo.lastSync}` : "Aucun compte connecté"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Synchroniser
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Importer relevé
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <Wallet className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{stats.balance.toLocaleString('fr-FR')} €</p>
              <p className="text-xs text-muted-foreground">Solde actuel</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">À rapprocher</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <CheckCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.matched}</p>
              <p className="text-xs text-muted-foreground">Rapprochées</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">+{stats.credits.toLocaleString('fr-FR')} €</p>
              <p className="text-xs text-muted-foreground">Encaissements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Rapprochement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher une transaction..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-medium">Date</TableHead>
                  <TableHead className="font-medium">Libellé</TableHead>
                  <TableHead className="font-medium text-right">Montant</TableHead>
                  <TableHead className="font-medium">Statut</TableHead>
                  <TableHead className="font-medium">Rapproché à</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard className="h-8 w-8 text-muted-foreground/50" />
                        <p className="text-muted-foreground">Aucune transaction trouvée</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="group border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            tx.type === "credit" 
                              ? "bg-emerald-100 dark:bg-emerald-950" 
                              : "bg-red-100 dark:bg-red-950"
                          }`}>
                            {tx.type === "credit" ? (
                              <ArrowDownLeft className={`h-4 w-4 text-emerald-600 dark:text-emerald-400`} />
                            ) : (
                              <ArrowUpRight className={`h-4 w-4 text-red-600 dark:text-red-400`} />
                            )}
                          </div>
                          <span className="font-medium max-w-[200px] truncate">{tx.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${
                        tx.type === "credit" ? "text-emerald-600" : "text-destructive"
                      }`}>
                        {tx.type === "credit" ? "+" : "-"}{tx.amount.toLocaleString('fr-FR')} €
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={tx.status === "matched" 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-0"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0"
                          }
                        >
                          {tx.status === "matched" ? (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Rapprochée
                            </>
                          ) : (
                            <>
                              <Clock className="mr-1 h-3 w-3" />
                              En attente
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tx.matchedTo || "-"}
                      </TableCell>
                      <TableCell>
                        {tx.status === "pending" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openMatchDialog(tx)}>
                                <Link2 className="mr-2 h-4 w-4" />
                                Rapprocher
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="reconciliation" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                  <Link2 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Rapprochement bancaire</CardTitle>
                  <CardDescription>
                    Associez les transactions bancaires aux paiements attendus
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Pending Transactions */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    Transactions à rapprocher ({transactions.filter(t => t.status === "pending").length})
                  </h3>
                  <div className="space-y-2">
                    {transactions.filter(t => t.status === "pending").length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle className="h-8 w-8 text-emerald-500/50 mb-2" />
                        <p className="text-muted-foreground text-sm">Toutes les transactions sont rapprochées</p>
                      </div>
                    ) : (
                      transactions.filter(t => t.status === "pending").map(tx => (
                        <div 
                          key={tx.id}
                          className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => openMatchDialog(tx)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              tx.type === "credit" 
                                ? "bg-emerald-100 dark:bg-emerald-950" 
                                : "bg-red-100 dark:bg-red-950"
                            }`}>
                              {tx.type === "credit" ? (
                                <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{tx.label}</p>
                              <p className="text-xs text-muted-foreground">{tx.date}</p>
                            </div>
                          </div>
                          <span className={`font-semibold ${tx.type === "credit" ? "text-emerald-600" : "text-destructive"}`}>
                            {tx.type === "credit" ? "+" : "-"}{tx.amount.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Pending Payments */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-blue-500" />
                    Paiements en attente ({pendingPayments.length})
                  </h3>
                  <div className="space-y-2">
                    {pendingPayments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle className="h-8 w-8 text-emerald-500/50 mb-2" />
                        <p className="text-muted-foreground text-sm">Aucun paiement en attente</p>
                      </div>
                    ) : (
                      pendingPayments.map(payment => (
                        <div 
                          key={payment.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                              <Landmark className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{payment.owner} - {payment.lot}</p>
                              <p className="text-xs text-muted-foreground">Échéance: {payment.dueDate}</p>
                            </div>
                          </div>
                          <span className="font-semibold">{payment.amount.toLocaleString('fr-FR')} €</span>
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
              <div className="p-4 rounded-lg border bg-muted/50 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    selectedTransaction.type === "credit" 
                      ? "bg-emerald-100 dark:bg-emerald-950" 
                      : "bg-red-100 dark:bg-red-950"
                  }`}>
                    {selectedTransaction.type === "credit" ? (
                      <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{selectedTransaction.label}</p>
                    <p className="text-sm text-muted-foreground">{selectedTransaction.date}</p>
                  </div>
                </div>
                <p className={`text-lg font-bold ${selectedTransaction.type === "credit" ? "text-emerald-600" : "text-destructive"}`}>
                  {selectedTransaction.type === "credit" ? "+" : "-"}{selectedTransaction.amount.toLocaleString('fr-FR')} €
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Sélectionnez le paiement correspondant:</p>
                {pendingPayments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Landmark className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground text-sm">Aucun paiement en attente</p>
                  </div>
                ) : (
                  pendingPayments.map(payment => (
                    <div 
                      key={payment.id}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                          <Landmark className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{payment.owner} - {payment.lot}</p>
                          <p className="text-xs text-muted-foreground">Appel de fonds</p>
                        </div>
                      </div>
                      <span className="font-semibold">{payment.amount.toLocaleString('fr-FR')} €</span>
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
