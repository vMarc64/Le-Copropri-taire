"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { use } from "react";
import { Loader2 } from "lucide-react";

const editTenantSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  siret: z.string().length(14, "Le SIRET doit contenir 14 chiffres").regex(/^\d+$/, "Le SIRET ne doit contenir que des chiffres"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  status: z.enum(["active", "pending", "suspended"]),
});

type EditTenantFormData = z.infer<typeof editTenantSchema>;

interface Tenant {
  id: string;
  name: string;
  email: string;
  siret: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  status: "active" | "pending" | "suspended";
  condominiums: number;
  users: number;
  createdAt: string;
}

export default function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditTenantFormData>({
    resolver: zodResolver(editTenantSchema),
  });

  const currentStatus = watch("status");

  useEffect(() => {
    async function fetchTenant() {
      try {
        setFetchLoading(true);
        // TODO: Fetch tenant data from API
        setTenant(null);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement du gestionnaire");
        console.error(err);
      } finally {
        setFetchLoading(false);
      }
    }
    fetchTenant();
  }, [id]);

  useEffect(() => {
    if (tenant) {
      reset(tenant);
    }
  }, [tenant, reset]);

  const onSubmit = async (data: EditTenantFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/admin/tenants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour");
      }

      router.push("/platform/tenants");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">
          Gestionnaire non trouvé
        </p>
        <Link href="/platform/tenants">
          <Button variant="outline">← Retour à la liste</Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/platform/tenants">
            <Button variant="ghost" size="sm">
              ← Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Modifier le Gestionnaire</h1>
            <p className="text-muted-foreground">
              {tenant.name} • Créé le {tenant.createdAt}
            </p>
          </div>
        </div>
        <Badge variant={
          tenant.status === "active" ? "default" :
          tenant.status === "suspended" ? "destructive" : "secondary"
        }>
          {tenant.status === "active" ? "Actif" :
           tenant.status === "suspended" ? "Suspendu" : "En attente"}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tenant.condominiums}</div>
            <p className="text-sm text-muted-foreground">Copropriétés gérées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tenant.users}</div>
            <p className="text-sm text-muted-foreground">Utilisateurs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tenant.createdAt}</div>
            <p className="text-sm text-muted-foreground">Date de création</p>
          </CardContent>
        </Card>
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

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Statut du compte</CardTitle>
            <CardDescription>
              Gérer l&apos;état du compte gestionnaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={currentStatus}
                onValueChange={(value) => setValue("status", value as EditTenantFormData["status"])}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">✅ Actif</SelectItem>
                  <SelectItem value="pending">⏳ En attente</SelectItem>
                  <SelectItem value="suspended">🚫 Suspendu</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {currentStatus === "suspended" && "Le gestionnaire ne pourra plus accéder à la plateforme."}
                {currentStatus === "pending" && "Le gestionnaire doit confirmer son compte."}
                {currentStatus === "active" && "Le gestionnaire a un accès complet à la plateforme."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button type="button" variant="destructive" disabled={isLoading}>
            🗑️ Supprimer le gestionnaire
          </Button>
          <div className="flex gap-4">
            <Link href="/platform/tenants">
              <Button type="button" variant="outline" disabled={isLoading}>
                Annuler
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
