"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Types pour les paramètres extensibles
interface SettingField {
  id: string;
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "select" | "textarea" | "date";
  value: string | number | boolean;
  options?: { value: string; label: string }[];
  description?: string;
  required?: boolean;
}

interface SettingGroup {
  id: string;
  name: string;
  icon: string;
  description: string;
  fields: SettingField[];
}

// Mock data - Structure extensible pour ajouter des paramètres dynamiquement
const settingGroups: SettingGroup[] = [
  {
    id: "general",
    name: "Informations générales",
    icon: "🏢",
    description: "Informations de base de la copropriété",
    fields: [
      { id: "1", key: "name", label: "Nom de la copropriété", type: "text", value: "Résidence Les Lilas", required: true },
      { id: "2", key: "address", label: "Adresse", type: "text", value: "12 rue des Lilas", required: true },
      { id: "3", key: "city", label: "Ville", type: "text", value: "Paris", required: true },
      { id: "4", key: "postal_code", label: "Code postal", type: "text", value: "75020", required: true },
      { id: "5", key: "siret", label: "SIRET", type: "text", value: "12345678901234" },
      { id: "6", key: "description", label: "Description", type: "textarea", value: "Belle résidence des années 80 avec jardin privatif" },
    ],
  },
  {
    id: "financial",
    name: "Paramètres financiers",
    icon: "💰",
    description: "Configuration des paiements et appels de fonds",
    fields: [
      { id: "10", key: "fiscal_year_start", label: "Début exercice comptable", type: "date", value: "01/01" },
      { id: "11", key: "call_frequency", label: "Fréquence des appels", type: "select", value: "quarterly", options: [
        { value: "monthly", label: "Mensuel" },
        { value: "quarterly", label: "Trimestriel" },
        { value: "biannual", label: "Semestriel" },
        { value: "annual", label: "Annuel" },
      ]},
      { id: "12", key: "payment_deadline_days", label: "Délai de paiement (jours)", type: "number", value: 30 },
      { id: "13", key: "late_fee_percent", label: "Pénalité de retard (%)", type: "number", value: 10 },
      { id: "14", key: "reminder_enabled", label: "Relances automatiques", type: "boolean", value: true },
      { id: "15", key: "reminder_days_before", label: "Relance J- (jours)", type: "number", value: 7 },
    ],
  },
  {
    id: "payment_methods",
    name: "Modes de paiement",
    icon: "💳",
    description: "Activation des différents modes de paiement",
    fields: [
      { id: "20", key: "sepa_enabled", label: "Prélèvement SEPA", type: "boolean", value: true, description: "Permettre les prélèvements SEPA automatiques" },
      { id: "21", key: "cb_enabled", label: "Carte bancaire", type: "boolean", value: true, description: "Permettre le paiement par carte bancaire" },
      { id: "22", key: "transfer_enabled", label: "Virement bancaire", type: "boolean", value: true, description: "Permettre les virements bancaires" },
      { id: "23", key: "check_enabled", label: "Chèque", type: "boolean", value: false, description: "Permettre les paiements par chèque" },
    ],
  },
  {
    id: "bank",
    name: "Coordonnées bancaires",
    icon: "🏦",
    description: "Informations du compte bancaire de la copropriété",
    fields: [
      { id: "30", key: "bank_name", label: "Nom de la banque", type: "text", value: "Crédit Mutuel" },
      { id: "31", key: "iban", label: "IBAN", type: "text", value: "FR76 1234 5678 9012 3456 7890 123" },
      { id: "32", key: "bic", label: "BIC", type: "text", value: "CMCIFRPP" },
      { id: "33", key: "creditor_id", label: "ICS (Identifiant Créancier SEPA)", type: "text", value: "FR12ZZZ123456" },
    ],
  },
  {
    id: "notifications",
    name: "Notifications",
    icon: "🔔",
    description: "Paramètres des notifications et alertes",
    fields: [
      { id: "40", key: "email_notifications", label: "Notifications par email", type: "boolean", value: true },
      { id: "41", key: "sms_notifications", label: "Notifications par SMS", type: "boolean", value: false },
      { id: "42", key: "notify_new_payment", label: "Notifier les nouveaux paiements", type: "boolean", value: true },
      { id: "43", key: "notify_overdue", label: "Notifier les impayés", type: "boolean", value: true },
      { id: "44", key: "overdue_threshold_days", label: "Seuil d'alerte impayé (jours)", type: "number", value: 15 },
    ],
  },
  {
    id: "documents",
    name: "Documents",
    icon: "📁",
    description: "Paramètres de gestion documentaire",
    fields: [
      { id: "50", key: "auto_archive_enabled", label: "Archivage automatique", type: "boolean", value: true },
      { id: "51", key: "archive_after_months", label: "Archiver après (mois)", type: "number", value: 24 },
      { id: "52", key: "max_file_size_mb", label: "Taille max fichier (MB)", type: "number", value: 10 },
    ],
  },
  {
    id: "custom",
    name: "Paramètres personnalisés",
    icon: "⚙️",
    description: "Paramètres additionnels spécifiques à cette copropriété",
    fields: [],
  },
];

export default function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: condoId } = use(params);
  const [settings, setSettings] = useState<SettingGroup[]>(settingGroups);
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("custom");
  const [newField, setNewField] = useState<Partial<SettingField>>({
    type: "text",
    value: "",
  });

  const updateFieldValue = (groupId: string, fieldId: string, value: string | number | boolean) => {
    setSettings(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          fields: group.fields.map(field => 
            field.id === fieldId ? { ...field, value } : field
          ),
        };
      }
      return group;
    }));
  };

  const addCustomField = () => {
    if (!newField.key || !newField.label) return;
    
    const field: SettingField = {
      id: `custom-${Date.now()}`,
      key: newField.key,
      label: newField.label,
      type: newField.type || "text",
      value: newField.value || "",
      description: newField.description,
    };

    setSettings(prev => prev.map(group => {
      if (group.id === selectedGroupId) {
        return { ...group, fields: [...group.fields, field] };
      }
      return group;
    }));

    setNewField({ type: "text", value: "" });
    setIsAddFieldOpen(false);
  };

  const renderField = (group: SettingGroup, field: SettingField) => {
    switch (field.type) {
      case "boolean":
        return (
          <div key={field.id} className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
              <Label htmlFor={field.id}>{field.label}</Label>
              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}
            </div>
            <Switch
              id={field.id}
              checked={field.value as boolean}
              onCheckedChange={(checked) => updateFieldValue(group.id, field.id, checked)}
            />
          </div>
        );
      case "select":
        return (
          <div key={field.id} className="grid gap-2 py-3 border-b last:border-0">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select 
              value={field.value as string}
              onValueChange={(value) => updateFieldValue(group.id, field.id, value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "textarea":
        return (
          <div key={field.id} className="grid gap-2 py-3 border-b last:border-0">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Textarea
              id={field.id}
              value={field.value as string}
              onChange={(e) => updateFieldValue(group.id, field.id, e.target.value)}
            />
          </div>
        );
      case "number":
        return (
          <div key={field.id} className="grid gap-2 py-3 border-b last:border-0">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              type="number"
              value={field.value as number}
              onChange={(e) => updateFieldValue(group.id, field.id, Number(e.target.value))}
              className="max-w-[200px]"
            />
          </div>
        );
      default:
        return (
          <div key={field.id} className="grid gap-2 py-3 border-b last:border-0">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="text"
              value={field.value as string}
              onChange={(e) => updateFieldValue(group.id, field.id, e.target.value)}
            />
          </div>
        );
    }
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
            <h1 className="text-3xl font-bold">⚙️ Paramètres</h1>
            <p className="text-muted-foreground">
              Configurez les paramètres de la copropriété
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">+ Ajouter un paramètre</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un paramètre personnalisé</DialogTitle>
                <DialogDescription>
                  Créez un nouveau paramètre pour cette copropriété
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="group">Groupe</Label>
                  <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.icon} {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="field-key">Clé (technique) *</Label>
                  <Input 
                    id="field-key" 
                    placeholder="ex: custom_field_name"
                    value={newField.key || ""}
                    onChange={(e) => setNewField(prev => ({ ...prev, key: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="field-label">Libellé *</Label>
                  <Input 
                    id="field-label" 
                    placeholder="ex: Mon paramètre personnalisé"
                    value={newField.label || ""}
                    onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="field-type">Type</Label>
                  <Select 
                    value={newField.type || "text"} 
                    onValueChange={(value) => setNewField(prev => ({ ...prev, type: value as SettingField["type"] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texte</SelectItem>
                      <SelectItem value="number">Nombre</SelectItem>
                      <SelectItem value="boolean">Oui/Non</SelectItem>
                      <SelectItem value="textarea">Texte long</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="field-description">Description (optionnel)</Label>
                  <Input 
                    id="field-description" 
                    placeholder="Description du paramètre"
                    value={newField.description || ""}
                    onChange={(e) => setNewField(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddFieldOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={addCustomField}>
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button>💾 Sauvegarder</Button>
        </div>
      </div>

      {/* Settings Groups */}
      <Accordion type="multiple" defaultValue={["general", "financial", "payment_methods"]} className="space-y-4">
        {settings.map((group) => (
          <AccordionItem key={group.id} value={group.id} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <span className="text-xl">{group.icon}</span>
                <div className="text-left">
                  <h3 className="font-semibold">{group.name}</h3>
                  <p className="text-sm text-muted-foreground font-normal">{group.description}</p>
                </div>
                {group.fields.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{group.fields.length}</Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              {group.fields.length > 0 ? (
                <div className="space-y-1">
                  {group.fields.map(field => renderField(group, field))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucun paramètre dans ce groupe</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setIsAddFieldOpen(true);
                    }}
                  >
                    + Ajouter un paramètre
                  </Button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Info Box */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">💡 Paramètres extensibles</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Cette page de paramètres est conçue pour être extensible. Vous pouvez ajouter 
            de nouveaux paramètres personnalisés à tout moment en cliquant sur 
            &quot;Ajouter un paramètre&quot;. Les paramètres sont organisés par groupes thématiques 
            et peuvent être de différents types (texte, nombre, oui/non, etc.).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
