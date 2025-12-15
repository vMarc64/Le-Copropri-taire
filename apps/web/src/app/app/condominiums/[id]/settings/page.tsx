"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CreditCard,
  Landmark,
  Bell,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Plus,
  ExternalLink,
  Banknote,
  Calendar,
} from "lucide-react";

interface CondominiumSettings {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  siret: string | null;
  callFrequency: "monthly" | "quarterly";
  sepaEnabled: boolean;
  cbEnabled: boolean;
  bankIban: string | null;
  bankBic: string | null;
  bankName: string | null;
  hasOpenBankingConnection: boolean;
  openBankingConnection: {
    id: string;
    bankName: string;
    status: string;
    lastSyncAt: string | null;
  } | null;
  linkedBankAccounts: Array<{
    id: string;
    accountName: string | null;
    bankName: string | null;
    accountNumber: string | null;
    iban: string | null;
    balance: string | null;
    lastSyncAt: string | null;
  }>;
}

export default function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: condoId } = use(params);
  const [settings, setSettings] = useState<CondominiumSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAddBankDialogOpen, setIsAddBankDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    siret: "",
    callFrequency: "monthly" as "monthly" | "quarterly",
    sepaEnabled: false,
    cbEnabled: false,
    bankIban: "",
    bankBic: "",
    bankName: "",
  });

  useEffect(() => {
    fetchSettings();
  }, [condoId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/condominiums/${condoId}/settings`);
      
      if (!response.ok) {
        throw new Error("Impossible de charger les paramètres");
      }

      const data: CondominiumSettings = await response.json();
      setSettings(data);
      
      // Initialize form data
      setFormData({
        name: data.name || "",
        address: data.address || "",
        city: data.city || "",
        postalCode: data.postalCode || "",
        siret: data.siret || "",
        callFrequency: data.callFrequency || "monthly",
        sepaEnabled: data.sepaEnabled || false,
        cbEnabled: data.cbEnabled || false,
        bankIban: data.bankIban || "",
        bankBic: data.bankBic || "",
        bankName: data.bankName || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`/api/condominiums/${condoId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Impossible de sauvegarder les paramètres");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Refresh settings
      await fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const handleConnectBank = () => {
    // TODO: Integrate Powens
    window.location.href = `/app/condominiums/${condoId}/bank/connect`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchSettings}>Réessayer</Button>
      </div>
    );
  }

  const hasPaymentMethod = formData.sepaEnabled || formData.cbEnabled;
  const hasBankAccount = settings?.hasOpenBankingConnection || formData.bankIban;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/app/condominiums/${condoId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Paramètres</h1>
            <p className="text-muted-foreground">
              Configurez les paramètres de la copropriété
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Sauvegarder
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-100 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="h-5 w-5" />
          <span>Paramètres sauvegardés avec succès</span>
        </div>
      )}
      {error && settings && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Informations générales */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Informations de base de la copropriété</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la copropriété *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Résidence Les Jardins"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siret">SIRET</Label>
              <Input
                id="siret"
                value={formData.siret}
                onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                placeholder="12345678901234"
                maxLength={14}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="12 rue de la Paix"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal *</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="75001"
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Paris"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paramètres financiers */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Paramètres financiers</CardTitle>
              <CardDescription>Configuration des appels de fonds</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="callFrequency">Fréquence des appels de fonds</Label>
            <Select
              value={formData.callFrequency}
              onValueChange={(value: "monthly" | "quarterly") => 
                setFormData({ ...formData, callFrequency: value })
              }
            >
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Mensuel</span>
                  </div>
                </SelectItem>
                <SelectItem value="quarterly">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Trimestriel</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Définit la périodicité de génération des appels de fonds pour les copropriétaires.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modes de paiement */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Modes de paiement</CardTitle>
              <CardDescription>Activez les modes de paiement autorisés sur cette copropriété</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasPaymentMethod && (
            <div className="flex items-center gap-3 rounded-lg bg-yellow-100 p-4 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p className="text-sm">
                Aucun mode de paiement activé. Les copropriétaires ne pourront pas effectuer de paiement en ligne.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <Banknote className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Prélèvement SEPA</p>
                  <p className="text-sm text-muted-foreground">
                    Prélèvement automatique sur le compte bancaire du copropriétaire
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.sepaEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, sepaEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Carte bancaire</p>
                  <p className="text-sm text-muted-foreground">
                    Paiement ponctuel par carte via Stripe
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.cbEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, cbEnabled: checked })}
              />
            </div>
          </div>

          {formData.sepaEnabled && (
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <p>
                <strong>Note :</strong> Pour activer le prélèvement SEPA, un compte bancaire doit être lié à cette copropriété
                et les copropriétaires devront signer un mandat de prélèvement.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compte bancaire */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Landmark className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Compte bancaire</CardTitle>
              <CardDescription>Compte bancaire de la copropriété pour la réception des paiements</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings?.hasOpenBankingConnection && settings.linkedBankAccounts.length > 0 ? (
            // Display connected accounts
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Compte connecté via Open Banking</span>
              </div>
              {settings.linkedBankAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <Landmark className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{account.bankName || "Compte bancaire"}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.iban ? `IBAN: ${account.iban.replace(/(.{4})/g, "$1 ").trim()}` : account.accountNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {account.balance ? `${parseFloat(account.balance).toLocaleString("fr-FR")} €` : "-"}
                    </p>
                    {account.lastSyncAt && (
                      <p className="text-xs text-muted-foreground">
                        Synchro: {new Date(account.lastSyncAt).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // No account connected
            <div className="space-y-4">
              {!hasBankAccount && (
                <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Aucun compte bancaire configuré. Ajoutez un RIB manuellement ou connectez un compte bancaire.
                  </p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start gap-2 p-4"
                  onClick={() => setIsAddBankDialogOpen(true)}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="font-medium">Ajouter un RIB</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Saisissez manuellement les coordonnées bancaires
                  </p>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col items-start gap-2 p-4"
                  onClick={handleConnectBank}
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <span className="font-medium">Connecter un compte</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Connexion sécurisée via Open Banking
                  </p>
                </Button>
              </div>

              {/* Manual bank details if entered */}
              {formData.bankIban && (
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{formData.bankName || "Compte bancaire"}</p>
                      <p className="text-sm text-muted-foreground">
                        IBAN: {formData.bankIban.replace(/(.{4})/g, "$1 ").trim()}
                      </p>
                      {formData.bankBic && (
                        <p className="text-sm text-muted-foreground">BIC: {formData.bankBic}</p>
                      )}
                    </div>
                    <Badge variant="secondary">Manuel</Badge>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Bell className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configuration des alertes et notifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p>Configuration des notifications à venir...</p>
          </div>
        </CardContent>
      </Card>

      {/* Add Bank Dialog */}
      <Dialog open={isAddBankDialogOpen} onOpenChange={setIsAddBankDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un RIB</DialogTitle>
            <DialogDescription>
              Saisissez les coordonnées bancaires de la copropriété
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Nom de la banque</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="Crédit Agricole"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankIban">IBAN *</Label>
              <Input
                id="bankIban"
                value={formData.bankIban}
                onChange={(e) => setFormData({ ...formData, bankIban: e.target.value.toUpperCase().replace(/\s/g, "") })}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankBic">BIC</Label>
              <Input
                id="bankBic"
                value={formData.bankBic}
                onChange={(e) => setFormData({ ...formData, bankBic: e.target.value.toUpperCase() })}
                placeholder="AGRIFRPP"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBankDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => setIsAddBankDialogOpen(false)}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
