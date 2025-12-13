"use client";

import { use, useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";

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

// Empty settings groups structure - to be filled from API or user creation
const defaultSettingGroups: SettingGroup[] = [
  {
    id: "general",
    name: "Informations générales",
    icon: "🏢",
    description: "Informations de base de la copropriété",
    fields: [],
  },
  {
    id: "financial",
    name: "Paramètres financiers",
    icon: "💰",
    description: "Configuration des paiements et appels de fonds",
    fields: [],
  },
  {
    id: "payment_methods",
    name: "Modes de paiement",
    icon: "💳",
    description: "Activation des différents modes de paiement",
    fields: [],
  },
  {
    id: "bank",
    name: "Coordonnées bancaires",
    icon: "🏦",
    description: "Informations du compte bancaire de la copropriété",
    fields: [],
  },
  {
    id: "notifications",
    name: "Notifications",
    icon: "🔔",
    description: "Paramètres des notifications et alertes",
    fields: [],
  },
  {
    id: "documents",
    name: "Documents",
    icon: "📁",
    description: "Paramètres de gestion documentaire",
    fields: [],
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
  const [settings, setSettings] = useState<SettingGroup[]>(defaultSettingGroups);
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("custom");
  const [newField, setNewField] = useState<Partial<SettingField>>({
    type: "text",
    value: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // TODO: Fetch from API
        setSettings(defaultSettingGroups);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des paramètres");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [condoId]);

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
