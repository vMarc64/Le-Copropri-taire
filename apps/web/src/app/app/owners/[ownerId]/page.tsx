"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  User,
  Mail,
  Building2,
  Home,
  CreditCard,
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Calendar,
  Euro,
  FileText,
  ChevronRight,
} from "lucide-react";
import { cachedFetch } from "@/lib/cache";

interface OwnerLot {
  id: string;
  reference: string;
  type: string;
  floor: number | null;
  surface: number | null;
  tantiemes: string | null;
}

interface OwnerCondominium {
  id: string;
  name: string;
  address: string;
  city: string;
  lots: OwnerLot[];
}

interface OwnerPayment {
  id: string;
  amount: number;
  paidAmount: number | null;
  status: string;
  type: string;
  description: string | null;
  dueDate: string;
  paidAt: string | null;
  condominiumId: string;
  condominiumName: string;
}

interface OwnerMandate {
  id: string;
  status: string;
  iban: string;
  bic: string | null;
  signedAt: string | null;
  createdAt: string;
}

interface OwnerDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
  condominiums: OwnerCondominium[];
  payments: OwnerPayment[];
  balance: number;
  mandates: OwnerMandate[];
  hasSepaMandateActive: boolean;
  stats: {
    totalLots: number;
    totalCondominiums: number;
    pendingPayments: number;
  };
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bgColor: string; textColor: string; icon: React.ReactNode }> = {
    active: { 
      label: "Actif", 
      bgColor: "bg-emerald-100 dark:bg-emerald-950", 
      textColor: "text-emerald-700 dark:text-emerald-400",
      icon: <CheckCircle2 className="h-3 w-3" />
    },
    pending: { 
      label: "En attente", 
      bgColor: "bg-amber-100 dark:bg-amber-950", 
      textColor: "text-amber-700 dark:text-amber-400",
      icon: <Clock className="h-3 w-3" />
    },
    invited: { 
      label: "Invité", 
      bgColor: "bg-blue-100 dark:bg-blue-950", 
      textColor: "text-blue-700 dark:text-blue-400",
      icon: <Mail className="h-3 w-3" />
    },
    suspended: { 
      label: "Suspendu", 
      bgColor: "bg-red-100 dark:bg-red-950", 
      textColor: "text-red-700 dark:text-red-400",
      icon: <AlertTriangle className="h-3 w-3" />
    },
  };

  const statusConfig = config[status] || { 
    label: status, 
    bgColor: "bg-gray-100 dark:bg-gray-800", 
    textColor: "text-gray-700 dark:text-gray-400",
    icon: null
  };

  return (
    <Badge variant="secondary" className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0 gap-1`}>
      {statusConfig.icon}
      {statusConfig.label}
    </Badge>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bgColor: string; textColor: string }> = {
    paid: { label: "Payé", bgColor: "bg-emerald-100 dark:bg-emerald-950", textColor: "text-emerald-700 dark:text-emerald-400" },
    pending: { label: "En attente", bgColor: "bg-amber-100 dark:bg-amber-950", textColor: "text-amber-700 dark:text-amber-400" },
    partial: { label: "Partiel", bgColor: "bg-blue-100 dark:bg-blue-950", textColor: "text-blue-700 dark:text-blue-400" },
    overdue: { label: "En retard", bgColor: "bg-red-100 dark:bg-red-950", textColor: "text-red-700 dark:text-red-400" },
  };

  const statusConfig = config[status] || { label: status, bgColor: "bg-gray-100", textColor: "text-gray-700" };

  return (
    <Badge variant="secondary" className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0`}>
      {statusConfig.label}
    </Badge>
  );
}

export default function OwnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ownerId = params.ownerId as string;

  const [owner, setOwner] = useState<OwnerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        setLoading(true);
        // Uses global cache - if prefetched on hover, returns instantly
        const data = await cachedFetch<OwnerDetails>(
          `/api/owners/${ownerId}`,
          { cacheKey: `owner-${ownerId}` }
        );
        setOwner(data);
      } catch (err) {
        if (err instanceof Error && err.message.includes('404')) {
          setError("Propriétaire non trouvé");
        } else {
          setError("Erreur lors du chargement");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (ownerId) {
      fetchOwner();
    }
  }, [ownerId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{error || "Propriétaire non trouvé"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const maskIban = (iban: string) => {
    if (iban.length < 8) return iban;
    return iban.slice(0, 4) + " •••• •••• " + iban.slice(-4);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <span className="text-lg font-semibold text-primary">
                {owner.firstName[0]}{owner.lastName[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{owner.firstName} {owner.lastName}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{owner.email}</span>
              </div>
            </div>
          </div>
        </div>
        <StatusBadge status={owner.status} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{owner.stats.totalLots}</p>
                <p className="text-sm text-muted-foreground">Lots</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950">
                <Building2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{owner.stats.totalCondominiums}</p>
                <p className="text-sm text-muted-foreground">Copropriétés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${owner.balance < 0 ? 'bg-red-100 dark:bg-red-950' : 'bg-emerald-100 dark:bg-emerald-950'}`}>
                <Euro className={`h-5 w-5 ${owner.balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${owner.balance < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                  {formatCurrency(owner.balance)}
                </p>
                <p className="text-sm text-muted-foreground">Solde</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${owner.hasSepaMandateActive ? 'bg-emerald-100 dark:bg-emerald-950' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <CreditCard className={`h-5 w-5 ${owner.hasSepaMandateActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{owner.hasSepaMandateActive ? "Actif" : "Aucun"}</p>
                <p className="text-sm text-muted-foreground">Mandat SEPA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Condominiums & Lots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Copropriétés & Lots
          </CardTitle>
        </CardHeader>
        <CardContent>
          {owner.condominiums.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucune copropriété associée</p>
          ) : (
            <div className="space-y-4">
              {owner.condominiums.map((condo) => (
                <div key={condo.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Link 
                        href={`/app/condominiums/${condo.id}`}
                        className="font-semibold hover:text-primary flex items-center gap-1"
                      >
                        {condo.name}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                      <p className="text-sm text-muted-foreground">{condo.address}, {condo.city}</p>
                    </div>
                    <Badge variant="secondary">{condo.lots.length} lot(s)</Badge>
                  </div>
                  {condo.lots.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {condo.lots.map((lot) => (
                        <div key={lot.id} className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{lot.reference}</p>
                            <p className="text-xs text-muted-foreground">
                              {lot.type}
                              {lot.surface && ` • ${lot.surface} m²`}
                              {lot.tantiemes && ` • ${lot.tantiemes} tantièmes`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Historique des paiements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {owner.payments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucun paiement</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Copropriété</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {owner.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(payment.dueDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.type}</p>
                          {payment.description && (
                            <p className="text-sm text-muted-foreground">{payment.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{payment.condominiumName}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payment.amount)}
                        {payment.paidAmount && payment.paidAmount > 0 && payment.paidAmount < payment.amount && (
                          <p className="text-xs text-muted-foreground">
                            Payé: {formatCurrency(payment.paidAmount)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <PaymentStatusBadge status={payment.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEPA Mandates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Mandats SEPA
          </CardTitle>
        </CardHeader>
        <CardContent>
          {owner.mandates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucun mandat SEPA</p>
          ) : (
            <div className="space-y-3">
              {owner.mandates.map((mandate) => (
                <div key={mandate.id} className="flex items-center justify-between border rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <CreditCard className={`h-8 w-8 ${mandate.status === 'active' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-mono font-medium">{maskIban(mandate.iban)}</p>
                      <p className="text-sm text-muted-foreground">
                        {mandate.signedAt ? `Signé le ${formatDate(mandate.signedAt)}` : `Créé le ${formatDate(mandate.createdAt)}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={mandate.status === 'active' ? 'default' : 'secondary'}>
                    {mandate.status === 'active' ? 'Actif' : mandate.status === 'revoked' ? 'Révoqué' : mandate.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
