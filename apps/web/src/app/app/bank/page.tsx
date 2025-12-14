"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Landmark,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Building2,
  Filter,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBankAccounts, getTransactions, type BankAccount, type Transaction } from "@/lib/api";

function ReconciliationBadge({ status }: { status: string }) {
  const config = {
    matched: { label: "Rapproché", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", icon: CheckCircle2 },
    pending: { label: "En attente", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400", icon: Clock },
    unmatched: { label: "Non rapproché", className: "bg-destructive/10 text-destructive", icon: AlertTriangle },
  }[status] || { label: status, className: "bg-muted text-muted-foreground", icon: Clock };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export default function BankPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCondominium, setSelectedCondominium] = useState<string>("all");
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [accountsData, transactionsData] = await Promise.all([
          getBankAccounts(),
          getTransactions(),
        ]);
        setBankAccounts(accountsData);
        setTransactions(transactionsData);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des données bancaires");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Extract unique condominiums from bank accounts
  const condominiums = useMemo(() => [
    { value: "all", label: "Toutes les résidences" },
    ...Array.from(new Map(bankAccounts.map(a => [a.condominiumId, { value: a.condominiumId, label: a.condominiumName }])).values()),
  ], [bankAccounts]);

  // Filter accounts by condominium
  const filteredAccounts = bankAccounts.filter((acc) => 
    selectedCondominium === "all" || acc.condominiumId === selectedCondominium
  );

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.counterpartyName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAccount = selectedAccount === "all" || tx.bankAccountId === selectedAccount;
    const matchesStatus = selectedStatus === "all" || tx.reconciliationStatus === selectedStatus;
    // Filter by condominium through bank account
    const account = bankAccounts.find(a => a.id === tx.bankAccountId);
    const matchesCondominium = selectedCondominium === "all" || account?.condominiumId === selectedCondominium;
    return matchesSearch && matchesAccount && matchesStatus && matchesCondominium;
  });

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const hasBankAccounts = bankAccounts.length > 0;
  const unmatchedCount = transactions.filter((tx) => tx.reconciliationStatus === "unmatched").length;
  const pendingCount = transactions.filter((tx) => tx.reconciliationStatus === "pending").length;

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 md:space-y-8 px-0 md:px-6 py-4 md:py-8 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 px-4 md:px-0">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
              Banque
            </h1>
            <p className="mt-1 text-[14px] md:text-[15px] text-muted-foreground">
              Gérez vos comptes bancaires et transactions
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" className="h-10 gap-2 rounded-lg px-4 text-[13px] font-medium">
              <RefreshCw className="h-4 w-4" />
              Synchroniser
            </Button>
            <Button className="h-10 gap-2 rounded-lg px-4 text-[13px] font-medium">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Connecter un compte</span>
              <span className="sm:hidden">Connecter</span>
            </Button>
          </div>
        </div>

        {/* Bank Accounts */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4 md:px-0">
          {/* Total Balance Card */}
          <Card className="p-0 md:col-span-1">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Landmark className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                  <p className="text-[12px] md:text-[13px] font-medium text-muted-foreground">Solde total</p>
                  <p className={`text-xl md:text-2xl font-semibold ${hasBankAccounts ? "text-foreground" : "text-muted-foreground"}`}>
                    {hasBankAccounts 
                      ? `${totalBalance.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`
                      : "N/A"}
                  </p>
                </div>
              </div>
              {hasBankAccounts && (
                <div className="mt-3 md:mt-4 flex items-center gap-4 text-[12px] md:text-[13px]">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                    +2.5% ce mois
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bank Accounts List */}
          {filteredAccounts.map((account) => (
            <Card key={account.id} className="p-0">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-muted">
                      <Landmark className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[13px] md:text-[14px] font-medium text-foreground">{account.bankName}</p>
                      <p className="text-[11px] md:text-[12px] text-muted-foreground">{account.accountName}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 md:mt-4">
                  <p className="text-xl font-semibold text-foreground">
                    {account.balance.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[12px] text-muted-foreground">{account.condominiumName}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Transactions */}
        <Tabs defaultValue="transactions" className="space-y-4 md:space-y-6 px-4 md:px-0">
          <div className="flex items-center justify-between overflow-x-auto">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="transactions" className="text-xs sm:text-sm">Transactions</TabsTrigger>
              <TabsTrigger value="reconciliation" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Rapprochement</span>
                <span className="sm:hidden">Rappro.</span>
                {(unmatchedCount + pendingCount) > 0 && (
                  <span className="ml-1 sm:ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-white">
                    {unmatchedCount + pendingCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="transactions" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 md:gap-4">
              <div className="relative flex-1 min-w-0 sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une transaction..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 pl-10 rounded-lg w-full"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedCondominium} onValueChange={setSelectedCondominium}>
                  <SelectTrigger className="w-full sm:w-[180px] md:w-[220px] h-10 rounded-lg">
                    <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Résidence" />
                  </SelectTrigger>
                  <SelectContent>
                    {condominiums.map((condo) => (
                      <SelectItem key={condo.value} value={condo.value}>{condo.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="w-[calc(50%-4px)] sm:w-[150px] md:w-[200px] h-10 rounded-lg">
                    <SelectValue placeholder="Tous les comptes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les comptes</SelectItem>
                    {bankAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.bankName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[calc(50%-4px)] sm:w-[140px] md:w-[180px] h-10 rounded-lg">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="matched">Rapproché</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="unmatched">Non rapproché</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Transactions List */}
            <Card className="overflow-hidden p-0">
              <div className="divide-y divide-border">
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 py-3 md:py-4 transition-colors hover:bg-muted/50 gap-3 sm:gap-4"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full ${
                        tx.type === "credit" 
                          ? "bg-emerald-500/10" 
                          : "bg-destructive/10"
                      }`}>
                        {tx.type === "credit" ? (
                          <ArrowDownLeft className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-destructive" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] md:text-[14px] font-medium text-foreground truncate">
                          {tx.counterpartyName || "Inconnu"}
                        </p>
                        <p className="text-[11px] md:text-[12px] text-muted-foreground line-clamp-1">
                          {tx.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-6 pl-12 sm:pl-0">
                      <div className="text-left sm:text-right">
                        <p className={`text-[13px] md:text-[14px] font-semibold ${
                          tx.type === "credit" 
                            ? "text-emerald-600 dark:text-emerald-400" 
                            : "text-foreground"
                        }`}>
                          {tx.type === "credit" ? "+" : ""}{tx.amount.toLocaleString("fr-FR")} €
                        </p>
                        <p className="text-[11px] md:text-[12px] text-muted-foreground">
                          {new Date(tx.transactionDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <ReconciliationBadge status={tx.reconciliationStatus} />
                    </div>
                  </div>
                ))}

                {filteredTransactions.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 md:py-12">
                    <Landmark className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground/50" />
                    <p className="mt-3 md:mt-4 text-[14px] md:text-[15px] font-medium text-foreground">Aucune transaction</p>
                    <p className="mt-1 text-[12px] md:text-[13px] text-muted-foreground text-center px-4">
                      Aucune transaction ne correspond à vos critères
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reconciliation" className="space-y-4">
            <Card className="p-4 md:p-6">
              <div className="flex flex-col items-center justify-center py-6 md:py-8">
                <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                </div>
                <h3 className="mt-3 md:mt-4 text-base md:text-lg font-semibold text-foreground text-center">Rapprochement bancaire</h3>
                <p className="mt-2 max-w-md text-center text-[13px] md:text-[14px] text-muted-foreground px-4">
                  Associez automatiquement les transactions bancaires aux paiements des copropriétaires.
                  L&apos;IA peut vous suggérer des correspondances.
                </p>
                <div className="mt-5 md:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto px-4 sm:px-0">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Voir les suggestions IA ({pendingCount})
                  </Button>
                  <Button className="w-full sm:w-auto">
                    Rapprocher manuellement ({unmatchedCount})
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
