"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface OwnerInfo {
  name: string;
  email: string;
  condominium: string;
  address: string;
}

interface LotInfo {
  id: string;
  reference: string;
  type: string;
  floor: number;
  surface: number;
  tantiemes: number;
}

interface BalanceInfo {
  total: number;
  nextCall: { amount: number; dueDate: string; label: string };
  sepaActive: boolean;
}

interface Payment {
  id: string;
  date: string;
  label: string;
  amount: number;
  status: string;
}

interface Document {
  id: string;
  name: string;
  date: string;
}

interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
}

export default function PortalDashboardPage() {
  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo | null>(null);
  const [lotsInfo, setLotsInfo] = useState<LotInfo[]>([]);
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API calls
        setOwnerInfo(null);
        setLotsInfo([]);
        setBalanceInfo(null);
        setRecentPayments([]);
        setRecentDocuments([]);
        setAnnouncements([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (!ownerInfo || !balanceInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">Bonjour, {ownerInfo.name.split(' ')[1]} 👋</h1>
        <p className="text-muted-foreground">
          {ownerInfo.condominium} • {ownerInfo.address}
        </p>
      </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-2xl font-bold ${balanceInfo.total === 0 ? "text-green-600" : "text-destructive"}`}>
                      {balanceInfo.total === 0 ? "À jour" : `${balanceInfo.total} €`}
                    </p>
                    <p className="text-sm text-muted-foreground">Solde actuel</p>
                  </div>
                  <span className="text-3xl">💰</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{balanceInfo.nextCall.amount} €</p>
                    <p className="text-sm text-muted-foreground">Prochain appel ({balanceInfo.nextCall.dueDate})</p>
                  </div>
                  <span className="text-3xl">📅</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{lotsInfo.length}</p>
                    <p className="text-sm text-muted-foreground">Lots</p>
                  </div>
                  <span className="text-3xl">🚪</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    {balanceInfo.sepaActive ? (
                      <Badge variant="default" className="text-base">✓ Actif</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-base">Non configuré</Badge>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">Mandat SEPA</p>
                  </div>
                  <span className="text-3xl">💳</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Announcements */}
          {announcements.length > 0 && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">📢 Annonces</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="rounded-lg border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{announcement.title}</h4>
                      <span className="text-xs text-muted-foreground">{announcement.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* My Lots */}
            <Card>
              <CardHeader>
                <CardTitle>🚪 Mes lots</CardTitle>
                <CardDescription>Lots dont vous êtes propriétaire</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Surface</TableHead>
                      <TableHead>Tantièmes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lotsInfo.map((lot) => (
                      <TableRow key={lot.id}>
                        <TableCell className="font-medium">{lot.reference}</TableCell>
                        <TableCell>{lot.type}</TableCell>
                        <TableCell>{lot.surface} m²</TableCell>
                        <TableCell>{lot.tantiemes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>💳 Derniers paiements</CardTitle>
                    <CardDescription>Historique de vos paiements</CardDescription>
                  </div>
                  <Link href="/portal/payments">
                    <Button variant="outline" size="sm">Voir tout →</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Libellé</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell className="font-medium">{payment.label}</TableCell>
                        <TableCell className="text-right">{payment.amount} €</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === "paid" ? "default" : "destructive"}>
                            {payment.status === "paid" ? "Payé" : "Impayé"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Documents & Actions */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Documents */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>📁 Documents récents</CardTitle>
                    <CardDescription>Documents mis à disposition</CardDescription>
                  </div>
                  <Link href="/portal/documents">
                    <Button variant="outline" size="sm">Voir tout →</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg border">
                      <span className="flex items-center gap-2">
                        <span>📄</span>
                        <span className="text-sm font-medium">{doc.name}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{doc.date}</span>
                        <Button variant="ghost" size="sm">⬇️</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>⚡ Actions rapides</CardTitle>
                <CardDescription>Accès aux fonctionnalités principales</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Link href="/portal/payments/pay">
                  <Button className="w-full justify-start" variant="outline">
                    💳 Payer par carte bancaire
                  </Button>
                </Link>
                <Link href="/portal/sepa">
                  <Button className="w-full justify-start" variant="outline">
                    🏦 Gérer mon mandat SEPA
                  </Button>
                </Link>
                <Link href="/portal/documents">
                  <Button className="w-full justify-start" variant="outline">
                    📁 Consulter les documents
                  </Button>
                </Link>
<Link href="/portal/consumptions">
              <Button className="w-full justify-start" variant="outline">
                📊 Voir mes consommations
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
