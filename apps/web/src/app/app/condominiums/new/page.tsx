"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const condominiumSchema = z.object({
  // Basic info
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  address: z.string().min(5, "L'adresse est requise"),
  city: z.string().min(2, "La ville est requise"),
  postalCode: z.string().regex(/^\d{5}$/, "Code postal invalide (5 chiffres)"),
  // Optional info
  description: z.string().optional(),
  siret: z.string().optional(),
  // Settings
  sepaEnabled: z.boolean().default(false),
  cbEnabled: z.boolean().default(false),
});

type CondominiumFormData = z.infer<typeof condominiumSchema>;

export default function NewCondominiumPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CondominiumFormData>({
    resolver: zodResolver(condominiumSchema),
    defaultValues: {
      sepaEnabled: false,
      cbEnabled: false,
    },
  });

  const sepaEnabled = watch("sepaEnabled");
  const cbEnabled = watch("cbEnabled");

  const onSubmit = async (data: CondominiumFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/condominiums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la création");
      }

      const result = await response.json();
      router.push(`/app/condominiums/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/app/condominiums">
          <Button variant="ghost" size="sm">← Retour</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nouvelle Copropriété</h1>
          <p className="text-muted-foreground">Créer une nouvelle copropriété</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>Informations de base de la copropriété</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la copropriété *</Label>
              <Input
                id="name"
                placeholder="Résidence Les Lilas"
                {...register("name")}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                placeholder="12 rue des Lilas"
                {...register("address")}
                disabled={isLoading}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal *</Label>
                <Input
                  id="postalCode"
                  placeholder="75020"
                  maxLength={5}
                  {...register("postalCode")}
                  disabled={isLoading}
                />
                {errors.postalCode && (
                  <p className="text-sm text-destructive">{errors.postalCode.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  placeholder="Paris"
                  {...register("city")}
                  disabled={isLoading}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description de la copropriété (optionnel)"
                {...register("description")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siret">SIRET du syndicat (optionnel)</Label>
              <Input
                id="siret"
                placeholder="12345678901234"
                maxLength={14}
                {...register("siret")}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Modes de paiement</CardTitle>
            <CardDescription>Configurez les options de paiement pour cette copropriété</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Prélèvement SEPA</Label>
                <p className="text-sm text-muted-foreground">
                  Activer le prélèvement automatique SEPA
                </p>
              </div>
              <Switch
                checked={sepaEnabled}
                onCheckedChange={(checked) => setValue("sepaEnabled", checked)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Paiement par carte</Label>
                <p className="text-sm text-muted-foreground">
                  Permettre le paiement par CB (Stripe)
                </p>
              </div>
              <Switch
                checked={cbEnabled}
                onCheckedChange={(checked) => setValue("cbEnabled", checked)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/app/condominiums">
            <Button type="button" variant="outline" disabled={isLoading}>
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Création..." : "Créer la copropriété"}
          </Button>
        </div>
      </form>
    </div>
  );
}
