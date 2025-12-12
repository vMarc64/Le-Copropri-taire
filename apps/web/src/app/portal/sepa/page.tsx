"use client";

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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Landmark,
  CheckCircle2,
  XCircle,
  Edit,
  AlertTriangle,
  Info,
  Calendar,
  Euro,
  FileSignature,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

// Mock data - Mandat SEPA existant
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

// Historique des prélèvements
const debitHistory = [
  { id: "1", date: "01/12/2025", label: "Appel de fonds T4 2025", amount: 450, status: "success" as const },
  { id: "2", date: "01/09/2025", label: "Appel de fonds T3 2025", amount: 450, status: "success" as const },
  { id: "3", date: "01/06/2025", label: "Appel de fonds T2 2025", amount: 450, status: "rejected" as const, reason: "Provision insuffisante" },
  { id: "4", date: "01/03/2025", label: "Appel de fonds T1 2025", amount: 450, status: "success" as const },
  { id: "5", date: "01/12/2024", label: "Appel de fonds T4 2024", amount: 420, status: "success" as const },
];

export default function SepaPage() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [mandate, setMandate] = useState(sepaMandate);
  const [autoDebit, setAutoDebit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveMandate = () => {
    setIsSubmitting(true);
    // Simulation de sauvegarde
    setTimeout(() => {
      setIsSubmitting(false);
      setIsEditOpen(false);
    }, 1000);
  };

  const handleRevoke = () => {
    setMandate(prev => ({ ...prev, active: false }));
    setIsRevokeOpen(false);
  };

  const handleSetupMandate = () => {
    // Simulation d'activation du mandat
    setMandate(prev => ({ ...prev, active: true }));
  };

  const successCount = debitHistory.filter(d => d.status === "success").length;
  const totalDebited = debitHistory.filter(d => d.status === "success").reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Landmark className="h-8 w-8" />
          Mandat SEPA
        </h1>
        <p className="text-muted-foreground">
          Gérez votre mandat de prélèvement automatique
        </p>
      </div>

      {/* Status Alert */}
      {mandate.active ? (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-700 dark:text-green-400">Mandat actif</AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-300">
            Vos appels de fonds seront prélevés automatiquement à chaque échéance.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <AlertTitle className="text-yellow-700 dark:text-yellow-400">Aucun mandat configuré</AlertTitle>
          <AlertDescription className="text-yellow-600 dark:text-yellow-300">
            Configurez un mandat SEPA pour bénéficier du prélèvement automatique.
          </AlertDescription>
        </Alert>
      )}

      {mandate.active ? (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{successCount}</p>
                    <p className="text-xs text-muted-foreground">Prélèvements réussis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
                    <Euro className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalDebited.toLocaleString("fr-FR")} €</p>
                    <p className="text-xs text-muted-foreground">Total prélevé</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mandate.nextDebit}</p>
                    <p className="text-xs text-muted-foreground">Prochain prélèvement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-2">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mandate.nextAmount} €</p>
                    <p className="text-xs text-muted-foreground">Montant prévu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mandate Details */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Informations du mandat</CardTitle>
                <CardDescription>Coordonnées bancaires enregistrées</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
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
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block">{mandate.iban}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">BIC</p>
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block">{mandate.bic}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Référence Unique de Mandat (RUM)</p>
                    <p className="font-mono text-xs">{mandate.rum}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de signature</p>
                    <p className="font-medium">{mandate.signedAt}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Debit & Auto Debit Setting */}
          <Card>
            <CardHeader>
              <CardTitle>Prochain prélèvement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Appel de fonds T1 2026</p>
                    <p className="text-sm text-muted-foreground">Prélèvement prévu le {mandate.nextDebit}</p>
                  </div>
                </div>
                <span className="text-2xl font-bold">{mandate.nextAmount} €</span>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
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
              <CardDescription>Derniers prélèvements effectués sur votre compte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {debitHistory.map((debit) => (
                  <div key={debit.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {debit.status === "success" ? (
                        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-1.5">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-1.5">
                          <XCircle className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{debit.label}</p>
                        <p className="text-sm text-muted-foreground">{debit.date}</p>
                        {debit.reason && (
                          <p className="text-xs text-red-600">{debit.reason}</p>
                        )}
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

          {/* Revoke Section */}
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Zone de danger
              </CardTitle>
              <CardDescription>
                La révocation du mandat arrêtera définitivement les prélèvements automatiques.
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
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5" />
              Configurer un mandat SEPA
            </CardTitle>
            <CardDescription>
              Le prélèvement automatique simplifie le paiement de vos charges de copropriété
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="holder">Titulaire du compte *</Label>
                <Input id="holder" placeholder="Jean Dupont" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="iban">IBAN *</Label>
                <Input id="iban" placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" className="font-mono" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bic">BIC *</Label>
                <Input id="bic" placeholder="BNPAFRPP" className="font-mono" />
              </div>
            </div>

            {/* Benefits Info */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-400">Avantages du prélèvement SEPA</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-blue-600 dark:text-blue-300">
                  <li>Paiement automatique à chaque échéance</li>
                  <li>Aucun risque d&apos;oubli ou de retard</li>
                  <li>Protection par la réglementation européenne</li>
                  <li>Révocable à tout moment</li>
                </ul>
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <p className="text-sm text-muted-foreground">
                Vos données bancaires sont sécurisées et chiffrées conformément aux normes PCI-DSS.
              </p>
            </div>

            <Button className="w-full" size="lg" onClick={handleSetupMandate}>
              <FileSignature className="h-4 w-4 mr-2" />
              Signer le mandat SEPA
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le mandat SEPA</DialogTitle>
            <DialogDescription>
              Modifiez vos coordonnées bancaires. Un nouveau mandat sera généré.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-holder">Titulaire du compte</Label>
              <Input id="edit-holder" defaultValue={mandate.accountHolder} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-iban">IBAN</Label>
              <Input id="edit-iban" defaultValue={mandate.iban} className="font-mono" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-bic">BIC</Label>
              <Input id="edit-bic" defaultValue={mandate.bic} className="font-mono" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveMandate} disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Sauvegarder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Dialog */}
      <Dialog open={isRevokeOpen} onOpenChange={setIsRevokeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Révoquer le mandat
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir révoquer votre mandat SEPA ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Cette action aura pour conséquence :
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Arrêt immédiat des prélèvements automatiques</li>
              <li>Nécessité de payer manuellement chaque appel de fonds</li>
              <li>Risque d&apos;impayés en cas d&apos;oubli</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRevokeOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleRevoke}>
              Confirmer la révocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
