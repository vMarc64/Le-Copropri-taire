"use client";

import { use, useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  sepaMandate: {
    active: boolean;
    iban: string;
    signedAt: string;
    rum: string;
  };
  lots: {
    id: string;
    reference: string;
    type: string;
    surface: number;
    tantiemes: number;
  }[];
  balance: number;
  totalTantiemes: number;
}

interface Payment {
  id: string;
  date: string;
  label: string;
  amount: number;
  status: string;
  method: string;
}

interface Document {
  id: string;
  name: string;
  date: string;
  type: string;
}

export default function OwnerProfilePage({ params }: { params: Promise<{ id: string; ownerId: string }> }) {
  const { id: condoId, ownerId } = use(params);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // TODO: Fetch from API
        setOwner(null);
        setPaymentHistory([]);
        setDocuments([]);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement du propriétaire");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [condoId, ownerId]);

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

  if (!owner) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Propriétaire non trouvé</p>
        <Link href={`/app/condominiums/${condoId}/owners`}>
          <Button variant="outline">Retour à la liste</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/app/condominiums/${condoId}/owners`}>
            <Button variant="ghost" size="sm">← Retour</Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{owner.name}</h1>
              <Badge variant={owner.balance === 0 ? "default" : "destructive"}>
                {owner.balance === 0 ? "À jour" : `${owner.balance} €`}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Propriétaire depuis le {owner.createdAt} • {owner.totalTantiemes} tantièmes
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">✏️ Modifier</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier le propriétaire</DialogTitle>
                <DialogDescription>
                  Modifiez les informations du propriétaire
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nom complet</Label>
                  <Input id="edit-name" defaultValue={owner.name} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input id="edit-email" type="email" defaultValue={owner.email} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-phone">Téléphone</Label>
                    <Input id="edit-phone" type="tel" defaultValue={owner.phone} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-address">Adresse postale</Label>
                  <Input id="edit-address" defaultValue={owner.address} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={() => setIsEditOpen(false)}>
                  Sauvegarder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button>📧 Envoyer un email</Button>
        </div>
      </div>

      {/* Owner Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📞 Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Email:</strong> {owner.email}</p>
            <p><strong>Téléphone:</strong> {owner.phone}</p>
            <p><strong>Adresse:</strong> {owner.address}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">🚪 Lots ({owner.lots.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {owner.lots.map(lot => (
              <div key={lot.id} className="flex items-center justify-between text-sm">
                <Link 
                  href={`/app/condominiums/${condoId}/lots/${lot.id}`}
                  className="text-primary hover:underline"
                >
                  {lot.reference}
                </Link>
                <span className="text-muted-foreground">
                  {lot.surface} m² • {lot.tantiemes} tantièmes
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">💳 Mandat SEPA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {owner.sepaMandate.active ? (
              <>
                <Badge variant="default">✓ Actif</Badge>
                <p><strong>IBAN:</strong> {owner.sepaMandate.iban}</p>
                <p><strong>RUM:</strong> {owner.sepaMandate.rum}</p>
                <p><strong>Signé le:</strong> {owner.sepaMandate.signedAt}</p>
              </>
            ) : (
              <div>
                <Badge variant="outline">Non configuré</Badge>
                <Button size="sm" className="mt-2 w-full">Configurer SEPA</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">💳 Paiements</TabsTrigger>
          <TabsTrigger value="documents">📁 Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Historique des paiements</CardTitle>
                  <CardDescription>
                    Tous les paiements effectués par ce propriétaire
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">Exporter CSV</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        Aucun paiement trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell className="font-medium">{payment.label}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.method}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{payment.amount} €</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === "paid" ? "default" : "destructive"}>
                            {payment.status === "paid" ? "Payé" : "Impayé"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>
                    Documents associés à ce propriétaire
                  </CardDescription>
                </div>
                <Button size="sm">📤 Ajouter un document</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                        Aucun document trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">📄 {doc.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {doc.type === "invoice" ? "Facture" : doc.type === "mandate" ? "Mandat" : "PV"}
                          </Badge>
                        </TableCell>
                        <TableCell>{doc.date}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">⬇️ Télécharger</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
