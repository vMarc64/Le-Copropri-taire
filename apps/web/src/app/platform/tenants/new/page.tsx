"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const tenantSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  siret: z.string().length(14, "Le SIRET doit contenir 14 chiffres").regex(/^\d+$/, "Le SIRET ne doit contenir que des chiffres"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  // Admin user info
  adminFirstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  adminLastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  adminEmail: z.string().email("Email invalide"),
  adminPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

type TenantFormData = z.infer<typeof tenantSchema>;

export default function NewTenantPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
  });

  const onSubmit = async (data: TenantFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la création");
      }

      router.push("/platform/tenants");
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
        <Link href="/platform/tenants">
          <Button variant="ghost" size="sm">
            ← Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nouveau Gestionnaire</h1>
          <p className="text-muted-foreground">
            Créer un nouveau Property Manager sur la plateforme
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de l&apos;entreprise</CardTitle>
            <CardDescription>
              Informations légales du cabinet de gestion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l&apos;entreprise *</Label>
                <Input
                  id="name"
                  placeholder="Syndic ABC"
                  {...register("name")}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="siret">SIRET *</Label>
                <Input
                  id="siret"
                  placeholder="12345678901234"
                  maxLength={14}
                  {...register("siret")}
                  disabled={isLoading}
                />
                {errors.siret && (
                  <p className="text-sm text-destructive">{errors.siret.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email entreprise *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@syndic.fr"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  placeholder="01 23 45 67 89"
                  {...register("phone")}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                placeholder="123 rue de Paris"
                {...register("address")}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  placeholder="Paris"
                  {...register("city")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  placeholder="75001"
                  maxLength={5}
                  {...register("postalCode")}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin User */}
        <Card>
          <CardHeader>
            <CardTitle>Administrateur du compte</CardTitle>
            <CardDescription>
              Utilisateur principal qui gérera ce compte gestionnaire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="adminFirstName">Prénom *</Label>
                <Input
                  id="adminFirstName"
                  placeholder="Jean"
                  {...register("adminFirstName")}
                  disabled={isLoading}
                />
                {errors.adminFirstName && (
                  <p className="text-sm text-destructive">{errors.adminFirstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminLastName">Nom *</Label>
                <Input
                  id="adminLastName"
                  placeholder="Dupont"
                  {...register("adminLastName")}
                  disabled={isLoading}
                />
                {errors.adminLastName && (
                  <p className="text-sm text-destructive">{errors.adminLastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="jean.dupont@syndic.fr"
                  {...register("adminEmail")}
                  disabled={isLoading}
                />
                {errors.adminEmail && (
                  <p className="text-sm text-destructive">{errors.adminEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">Mot de passe *</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("adminPassword")}
                  disabled={isLoading}
                />
                {errors.adminPassword && (
                  <p className="text-sm text-destructive">{errors.adminPassword.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/platform/tenants">
            <Button type="button" variant="outline" disabled={isLoading}>
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Création..." : "Créer le gestionnaire"}
          </Button>
        </div>
      </form>
    </div>
  );
}
