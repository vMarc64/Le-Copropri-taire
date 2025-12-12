"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

// Mock data
const sepaMandate = {
  active: true,
  iban: "FR76 1234 5678 9012 3456 7890 123",
  bic: "BNPAFRPP",
  bankName: "BNP Paribas",
  accountHolder: "Jean Dupont",
  rum: "SEPA-2024-001-DUPONT",
  signedAt: "20/03/2024",
  lastDebit: "01/12/2025",
  nextDebit: "01/01/2026",
  nextAmount: 450,
};

const ownerInfo = {
  name: "M. Jean Dupont",
};

export default function SepaPage() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [mandate, setMandate] = useState(sepaMandate);
  const [autoDebit, setAutoDebit] = useState(true);

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
              <Button variant="ghost" size="sm">Paiements</Button>
            </Link>
            <Link href="/portal/documents">
              <Button variant="ghost" size="sm">Documents</Button>
            </Link>
            <Link href="/portal/sepa">
              <Button variant="default" size="sm">Mandat SEPA</Button>
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
        <div className="space-y-6 max-w-3xl">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">🏦 Mandat SEPA</h1>
            <p className="text-muted-foreground">
              Gérez votre mandat de prélèvement automatique
            </p>
          </div>

          {/* Status Card */}
          <Card className={mandate.active ? "border-green-500/50 bg-green-500/5" : "border-yellow-500/50 bg-yellow-500/5"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Statut du mandat
                    {mandate.active ? (
                      <Badge variant="default" className="bg-green-600">✓ Actif</Badge>
                    ) : (
                      <Badge variant="secondary">Non configuré</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {mandate.active 
                      ? "Vos appels de fonds seront prélevés automatiquement"
                      : "Configurez un mandat pour activer le prélèvement automatique"
                    }
                  </CardDescription>
                </div>
                {mandate.active && (
                  <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                    ✏️ Modifier
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          {mandate.active ? (
            <>
              {/* Mandate Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations du mandat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Titulaire du compte</p>
                      <p className="font-medium">{mandate.accountHolder}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Banque</p>
                      <p className="font-medium">{mandate.bankName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">IBAN</p>
                      <p className="font-mono">{mandate.iban}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">BIC</p>
                      <p className="font-mono">{mandate.bic}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Référence Unique de Mandat (RUM)</p>
                      <p className="font-mono text-sm">{mandate.rum}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date de signature</p>
                      <p className="font-medium">{mandate.signedAt}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Debit */}
              <Card>
                <CardHeader>
                  <CardTitle>Prochain prélèvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Appel de fonds T1 2026</p>
                      <p className="text-sm text-muted-foreground">Prélèvement prévu le {mandate.nextDebit}</p>
                    </div>
                    <span className="text-2xl font-bold">{mandate.nextAmount} €</span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div>
                      <p className="font-medium">Prélèvement automatique</p>
                      <p className="text-sm text-muted-foreground">
                        {autoDebit 
                          ? "Les appels de fonds seront prélevés automatiquement"
                          : "Vous devrez payer manuellement chaque appel"
                        }
                      </p>
                    </div>
                    <Switch checked={autoDebit} onCheckedChange={setAutoDebit} />
                  </div>
                </CardContent>
              </Card>

              {/* Debit History */}
              <Card>
                <CardHeader>
                  <CardTitle>Historique des prélèvements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { date: "01/12/2025", label: "Appel T4 2025", amount: 450, status: "success" },
                      { date: "01/09/2025", label: "Appel T3 2025", amount: 450, status: "success" },
                      { date: "01/06/2025", label: "Appel T2 2025", amount: 450, status: "rejected" },
                      { date: "01/03/2025", label: "Appel T1 2025", amount: 450, status: "success" },
                    ].map((debit, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className={debit.status === "success" ? "text-green-600" : "text-red-600"}>
                            {debit.status === "success" ? "✓" : "✗"}
                          </span>
                          <div>
                            <p className="font-medium">{debit.label}</p>
                            <p className="text-sm text-muted-foreground">{debit.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{debit.amount} €</p>
                          <Badge variant={debit.status === "success" ? "default" : "destructive"}>
                            {debit.status === "success" ? "Prélevé" : "Rejeté"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revoke */}
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Révoquer le mandat</CardTitle>
                  <CardDescription>
                    Cette action désactivera le prélèvement automatique. Vous devrez payer manuellement.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" onClick={() => setIsRevokeOpen(true)}>
                    Révoquer le mandat SEPA
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Setup New Mandate */
            <Card>
              <CardHeader>
                <CardTitle>Configurer un mandat SEPA</CardTitle>
                <CardDescription>
                  Le prélèvement automatique simplifie le paiement de vos charges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="holder">Titulaire du compte *</Label>
                    <Input id="holder" placeholder="Jean Dupont" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="iban">IBAN *</Label>
                    <Input id="iban" placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bic">BIC *</Label>
                    <Input id="bic" placeholder="BNPAFRPP" />
                  </div>
                </div>
                <div className="flex items-start gap-2 p-4 bg-muted rounded-lg">
                  <span className="text-xl">ℹ️</span>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Avantages du prélèvement SEPA</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Paiement automatique à chaque échéance</li>
                      <li>Aucun risque d&apos;oubli ou de retard</li>
                      <li>Protection par la réglementation européenne</li>
                      <li>Révocable à tout moment</li>
                    </ul>
                  </div>
                </div>
                <Button className="w-full">
                  ✍️ Signer le mandat SEPA
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le mandat SEPA</DialogTitle>
            <DialogDescription>
              Modifiez vos coordonnées bancaires
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-holder">Titulaire du compte</Label>
              <Input id="edit-holder" defaultValue={mandate.accountHolder} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-iban">IBAN</Label>
              <Input id="edit-iban" defaultValue={mandate.iban} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-bic">BIC</Label>
              <Input id="edit-bic" defaultValue={mandate.bic} />
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

      {/* Revoke Dialog */}
      <Dialog open={isRevokeOpen} onOpenChange={setIsRevokeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">⚠️ Révoquer le mandat</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir révoquer votre mandat SEPA ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Cette action aura pour conséquence :
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
              <li>Arrêt immédiat des prélèvements automatiques</li>
              <li>Nécessité de payer manuellement chaque appel de fonds</li>
              <li>Risque d&apos;impayés en cas d&apos;oubli</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRevokeOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => {
              setMandate(prev => ({ ...prev, active: false }));
              setIsRevokeOpen(false);
            }}>
              Confirmer la révocation
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
